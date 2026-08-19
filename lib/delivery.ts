import { getSql } from '@/lib/db';
import { getIssue } from '@/lib/issues';
import { renderIssueEmail } from '@/lib/email/templates';
import { sendEmail, currentProvider } from '@/lib/email/mailer';

/**
 * 一斉配信。
 *
 * 送信そのものは lib/email/mailer.ts に任せ、ここでは
 * 「誰に送るか」「どこまで送れたか」だけを扱う。
 *
 * 1回の呼び出しで送りきらない設計にしている。サーバーレス関数には実行時間の
 * 上限があり、名簿が増えるほど途中で打ち切られる可能性が上がるため。
 * 送れた相手は deliveries に記録され、次の呼び出しでは対象から外れるので、
 * 残りが 0 になるまで繰り返し呼べば全員に届く（二重には届かない）。
 */

/** 1回の呼び出しで送る上限。関数のタイムアウトに引っかからない範囲に抑える */
export const BATCH_LIMIT = 200;

/** 同時に投げる本数。送信サービスのレート制限（Resend は 2req/秒が既定）に配慮する */
const CONCURRENCY = 4;

/** 1回分の送信が終わるたびに置く間隔（ミリ秒） */
const THROTTLE_MS = 600;

export interface DeliveryStats {
  /** 送信できた数 */
  sent: number;
  /** 直近の試行で失敗し、まだ送れていない数 */
  failed: number;
  /** これから送る相手の数（未着手＋失敗の再送分） */
  remaining: number;
}

/** 配信状況。配信ページの表示と、送信前の判断に使う */
export async function getDeliveryStats(issueId: string): Promise<DeliveryStats> {
  const sql = getSql();

  const [row] = await sql<{ sent: number; failed: number; remaining: number }>`
    select
      (select count(*)::int from deliveries d
        where d.issue_id = ${issueId} and d.sent_at is not null) as sent,
      (select count(*)::int from deliveries d
        where d.issue_id = ${issueId} and d.sent_at is null) as failed,
      (select count(*)::int from subscribers s
        where s.status = 'active'
          and not exists (
            select 1 from deliveries d
             where d.issue_id = ${issueId}
               and d.subscriber_id = s.id
               and d.sent_at is not null
          )) as remaining
  `;

  return row ?? { sent: 0, failed: 0, remaining: 0 };
}

export interface FailureRow {
  email: string;
  error: string | null;
  attempted_at: string;
}

/** 失敗した宛先。原因が名簿側にあるのか送信側にあるのかを見分けるために出す */
export async function listFailures(issueId: string, limit = 20): Promise<FailureRow[]> {
  const sql = getSql();
  return sql<FailureRow>`
    select s.email, d.error, d.attempted_at
      from deliveries d
      join subscribers s on s.id = d.subscriber_id
     where d.issue_id = ${issueId} and d.sent_at is null
     order by d.attempted_at desc
     limit ${limit}
  `;
}

export interface SendSummary {
  sent: number;
  failed: number;
  /** この呼び出しのあとに残っている相手の数 */
  remaining: number;
  provider: string;
  /** 1通も送らずに終わったときの理由 */
  error?: string;
}

interface Target {
  id: string;
  email: string;
  unsub_token: string;
}

interface Attempt {
  subscriberId: string;
  sentAt: string | null;
  error: string | null;
  provider: string | null;
  messageId: string | null;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * この号をまだ受け取っていない購読者に送る（最大 BATCH_LIMIT 件）。
 *
 * 呼び出し側は remaining が 0 になるまで呼び直してよい。
 * すでに sent_at が入っている相手は毎回 SQL 側で除外されるので、
 * 何度押しても同じ人に二度届くことはない。
 */
export async function sendIssueBatch(issueId: string): Promise<SendSummary> {
  const sql = getSql();
  const provider = currentProvider();

  const issue = await getIssue(issueId);
  if (!issue) {
    return { sent: 0, failed: 0, remaining: 0, provider, error: '号が見つかりません。' };
  }
  if (!issue.subject.trim()) {
    return { sent: 0, failed: 0, remaining: 0, provider, error: '件名が空です。' };
  }
  if (!issue.body_md.trim()) {
    return { sent: 0, failed: 0, remaining: 0, provider, error: '本文が空です。' };
  }

  const targets = await sql<Target>`
    select s.id, s.email, s.unsub_token
      from subscribers s
     where s.status = 'active'
       and not exists (
         select 1 from deliveries d
          where d.issue_id = ${issueId}
            and d.subscriber_id = s.id
            and d.sent_at is not null
       )
     order by s.created_at
     limit ${BATCH_LIMIT}
  `;

  if (targets.length === 0) {
    // 送る相手がいない。すでに1通でも送っていれば配信しきったということなので
    // 配信済みにする。1通も送っていないなら名簿が空なだけなので、下書きのまま残す。
    const before = await getDeliveryStats(issueId);
    if (before.sent > 0) await finishIssue(issueId);
    return {
      sent: 0,
      failed: 0,
      remaining: 0,
      provider,
      error: before.sent > 0 ? 'すでに全員に配信済みです。' : '配信対象の購読者がいません。',
    };
  }

  // 配信を始めた時点で編集を止める。届いたメールと原稿が食い違わないようにする。
  await sql`
    update issues set status = 'sending', updated_at = now()
     where id = ${issueId} and status = 'draft'
  `;

  const siteUrl = process.env.SITE_URL ?? 'https://www.shinealight.jp';
  const attempts: Attempt[] = [];

  for (let i = 0; i < targets.length; i += CONCURRENCY) {
    const chunk = targets.slice(i, i + CONCURRENCY);

    const results = await Promise.all(
      chunk.map(async (target): Promise<Attempt> => {
        // 解除リンクは1人ずつ違う。本文の生成も宛先ごとにやり直す。
        const unsubUrl = `${siteUrl}/newsletter/unsubscribe?token=${encodeURIComponent(target.unsub_token)}`;
        const { html, text } = renderIssueEmail({
          subject: issue.subject,
          preheader: issue.preheader,
          bodyMd: issue.body_md,
          unsubUrl,
        });

        try {
          const result = await sendEmail({
            to: target.email,
            subject: issue.subject,
            html,
            text,
            headers: {
              // RFC 8058 のワンクリック解除。これが無いと Gmail は
              // 一括送信者として扱ってくれず、迷惑メール判定が厳しくなる。
              'List-Unsubscribe': `<${siteUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(target.unsub_token)}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
          });
          return {
            subscriberId: target.id,
            sentAt: new Date().toISOString(),
            error: null,
            provider: result.provider,
            messageId: result.id,
          };
        } catch (error) {
          return {
            subscriberId: target.id,
            sentAt: null,
            error: (error instanceof Error ? error.message : '不明なエラー').slice(0, 500),
            provider,
            messageId: null,
          };
        }
      })
    );

    attempts.push(...results);
    if (i + CONCURRENCY < targets.length) await sleep(THROTTLE_MS);
  }

  await recordAttempts(issueId, attempts);

  const sent = attempts.filter((a) => a.sentAt !== null).length;
  const failed = attempts.length - sent;

  const stats = await getDeliveryStats(issueId);
  // 全員に届いたときだけ配信済みにする。残っていれば 'sending' のまま置いて、
  // 編集を止めたまま再送できるようにする。
  if (stats.remaining === 0) await finishIssue(issueId);

  return { sent, failed, remaining: stats.remaining, provider };
}

/** 試行結果をまとめて1クエリで書き込む。1件ずつ往復すると名簿の数だけ遅くなる */
async function recordAttempts(issueId: string, attempts: Attempt[]): Promise<void> {
  if (attempts.length === 0) return;
  const sql = getSql();

  await sql`
    insert into deliveries (issue_id, subscriber_id, sent_at, error, provider, message_id, attempted_at)
    select ${issueId}::uuid, x.subscriber_id::uuid, x.sent_at::timestamptz, x.error, x.provider, x.message_id, now()
      from unnest(
        ${attempts.map((a) => a.subscriberId)}::text[],
        ${attempts.map((a) => a.sentAt)}::text[],
        ${attempts.map((a) => a.error)}::text[],
        ${attempts.map((a) => a.provider)}::text[],
        ${attempts.map((a) => a.messageId)}::text[]
      ) as x(subscriber_id, sent_at, error, provider, message_id)
    on conflict (issue_id, subscriber_id) do update
       set sent_at    = excluded.sent_at,
           error      = excluded.error,
           provider   = excluded.provider,
           message_id = excluded.message_id,
           attempted_at = excluded.attempted_at
  `;
}

/**
 * 号を配信済みにする。
 * recipient_count は「実際に届いた数」。配信済みのあとで増えた購読者に
 * 追加で送った場合も、その分を含めて数え直す（名簿の増減ではなく、
 * 届いた通数の記録なので）。sent_at は最初に配信し終えた時刻のまま動かさない。
 */
async function finishIssue(issueId: string): Promise<void> {
  const sql = getSql();
  await sql`
    update issues
       set status = 'sent',
           sent_at = coalesce(sent_at, now()),
           recipient_count = (
             select count(*)::int from deliveries d
              where d.issue_id = ${issueId} and d.sent_at is not null
           ),
           updated_at = now()
     where id = ${issueId}
  `;
}

// ===== 送信サービスからの通知（webhook）=====

/** 開封を記録する。初回だけ残し、二度目以降は上書きしない */
export async function markOpened(messageId: string): Promise<boolean> {
  if (!messageId) return false;
  const sql = getSql();
  const rows = await sql<{ issue_id: string }>`
    update deliveries
       set opened_at = now()
     where message_id = ${messageId}
       and opened_at is null
     returning issue_id
  `;
  return rows.length > 0;
}

/**
 * 送信は受け付けられたが、その後に届かなかったと通知された。
 * 配信記録に理由を残す。sent_at は消さない（再送の対象にはしない。
 * 宛先が死んでいる場合、名簿側で bounced にするのが正しい対処なので）。
 */
export async function markDeliveryFailed(messageId: string, reason: string): Promise<boolean> {
  if (!messageId) return false;
  const sql = getSql();
  const rows = await sql<{ issue_id: string }>`
    update deliveries
       set error = ${reason.slice(0, 500)}
     where message_id = ${messageId}
     returning issue_id
  `;
  return rows.length > 0;
}

/** 号ごとの開封数。一覧や配信ページに出す */
export async function countOpened(issueId: string): Promise<number> {
  const sql = getSql();
  const [row] = await sql<{ count: number }>`
    select count(*)::int as count from deliveries
     where issue_id = ${issueId} and opened_at is not null
  `;
  return row?.count ?? 0;
}
