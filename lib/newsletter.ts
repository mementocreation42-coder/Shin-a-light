import { getSql } from '@/lib/db';

export type SubscriberStatus =
  | 'pending'
  | 'active'
  | 'unsubscribed'
  | 'bounced'
  | 'complained';

export interface Subscriber {
  id: string;
  email: string;
  status: SubscriberStatus;
  unsub_token: string;
  created_at: string;
}

/**
 * 保存前のメールアドレス正規化。
 * unique 制約は文字列一致なので、ここを通さないと Foo@x.com と foo@x.com が
 * 別人として二重登録される。
 */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** URL に埋め込める使い捨てトークン（128bit）。Edge でも動くよう Web Crypto を使う */
export function generateToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export interface RegisterInput {
  email: string;
  source?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface RegisterResult {
  /**
   * 確認メールを送るべきときだけトークンが入る。
   * すでに購読中の場合や、直前に送ったばかりの場合は null。
   */
  confirmToken: string | null;
}

/**
 * 同じ相手に確認メールを送り直すまでの最短間隔。
 * これが無いと、他人のアドレスを繰り返し送信してメール爆撃に使えてしまう。
 */
const RESEND_INTERVAL_MS = 5 * 60 * 1000;

/**
 * 購読登録（ダブルオプトイン）。
 *
 * 登録直後は pending。確認メールのリンクを踏んで初めて active になる。
 * 誤入力や第三者による登録を防ぎ、同意の証跡にもなる。
 *
 * 呼び出し側は結果の違いを利用者に見せてはいけない。
 * 「登録済みかどうか」が分かると、他人のアドレスの登録状況を調べられてしまう。
 */
export async function registerSubscriber(input: RegisterInput): Promise<RegisterResult> {
  const sql = getSql();
  const email = normalizeEmail(input.email);

  const existing = await sql<{
    id: string;
    status: SubscriberStatus;
    confirm_sent_at: string | null;
  }>`
    select id, status, confirm_sent_at from subscribers where email = ${email}
  `;

  if (existing.length > 0) {
    const { status, confirm_sent_at } = existing[0];

    // 迷惑メール報告を受けたアドレスは復活させない。
    // 再開したい場合は本人からの連絡を受けて手作業で戻す。
    if (status === 'complained') return { confirmToken: null };

    // すでに購読中。何も送らない
    if (status === 'active') return { confirmToken: null };

    // 確認待ちの再送信。短時間の連打には応じない
    if (status === 'pending' && confirm_sent_at) {
      const elapsed = Date.now() - new Date(confirm_sent_at).getTime();
      if (elapsed < RESEND_INTERVAL_MS) return { confirmToken: null };
    }

    // pending の再送信、または unsubscribed / bounced からの再登録。
    // いずれも確認メールを踏ませ直す。
    const token = generateToken();
    await sql`
      update subscribers
         set status = 'pending',
             confirm_token = ${token},
             confirm_sent_at = now(),
             unsubscribed_at = null,
             source = ${input.source ?? null},
             ip_address = ${input.ipAddress ?? null},
             user_agent = ${input.userAgent ?? null},
             updated_at = now()
       where email = ${email}
    `;
    return { confirmToken: token };
  }

  const token = generateToken();
  const inserted = await sql<{ id: string }>`
    insert into subscribers (
      email, status, confirm_token, confirm_sent_at, unsub_token,
      source, ip_address, user_agent
    )
    values (
      ${email}, 'pending', ${token}, now(), ${generateToken()},
      ${input.source ?? null}, ${input.ipAddress ?? null}, ${input.userAgent ?? null}
    )
    on conflict (email) do nothing
    returning id
  `;

  // 同時に2回投げられて競り負けた場合。相手側が確認メールを送っている
  if (inserted.length === 0) return { confirmToken: null };

  return { confirmToken: token };
}

export type ConfirmResult = 'confirmed' | 'already_active' | 'invalid';

/**
 * 確認メールのリンクを踏んだときの処理。
 *
 * トークンは消費後も消さない。消してしまうと、二度目に踏んだときに
 * 「登録済み」なのか「でたらめなURL」なのか区別できず、
 * 正規の利用者にエラーを見せることになる。
 * 状態が pending のときしか効かないので、残しておいても再利用はされない。
 */
export async function confirmSubscriber(token: string): Promise<ConfirmResult> {
  const sql = getSql();
  if (!token) return 'invalid';

  const rows = await sql<{ id: string }>`
    update subscribers
       set status = 'active',
           consented_at = now(),
           updated_at = now()
     where confirm_token = ${token} and status = 'pending'
     returning id
  `;
  if (rows.length > 0) return 'confirmed';

  const found = await sql<{ status: SubscriberStatus }>`
    select status from subscribers where confirm_token = ${token}
  `;

  // 解除済み・不達のアドレスを古いリンクで復活させない
  return found[0]?.status === 'active' ? 'already_active' : 'invalid';
}

export type UnsubscribeResult = 'unsubscribed' | 'already_off' | 'invalid';

/** 解除リンクのトークンから購読者を引く（確認画面に出す用） */
export async function findByUnsubToken(
  token: string
): Promise<{ email: string; status: SubscriberStatus } | null> {
  const sql = getSql();
  if (!token) return null;

  const rows = await sql<{ email: string; status: SubscriberStatus }>`
    select email, status from subscribers where unsub_token = ${token}
  `;
  return rows[0] ?? null;
}

/**
 * 配信解除。
 * unsub_token は解除後も消さない。同じリンクを二度踏んだときに
 * 「無効なリンク」ではなく「解除済み」と表示できるようにするため。
 */
export async function unsubscribeByToken(token: string): Promise<UnsubscribeResult> {
  const sql = getSql();
  if (!token) return 'invalid';

  const found = await findByUnsubToken(token);
  if (!found) return 'invalid';
  if (found.status === 'unsubscribed') return 'already_off';

  await sql`
    update subscribers
       set status = 'unsubscribed',
           unsubscribed_at = now(),
           updated_at = now()
     where unsub_token = ${token}
  `;
  return 'unsubscribed';
}

// ===== 管理画面向け =====

export interface ListOptions {
  page?: number;
  perPage?: number;
  /** メールアドレスの部分一致 */
  q?: string;
  status?: SubscriberStatus;
}

export interface SubscriberRow {
  id: string;
  email: string;
  status: SubscriberStatus;
  source: string | null;
  created_at: string;
  unsubscribed_at: string | null;
}

export async function listSubscribers(
  opts: ListOptions = {}
): Promise<{ rows: SubscriberRow[]; total: number }> {
  const sql = getSql();

  const perPage = Math.min(Math.max(opts.perPage ?? 50, 1), 200);
  const page = Math.max(opts.page ?? 1, 1);
  const offset = (page - 1) * perPage;

  // LIKE のワイルドカードを打ち消してから前後に % を付ける。
  // そうしないと "%" の入力で全件一致になる。
  const q = opts.q?.trim()
    ? `%${opts.q.trim().toLowerCase().replace(/[\\%_]/g, (c) => `\\${c}`)}%`
    : null;
  const status = opts.status ?? null;

  // 条件は null 許容の同じ式で書き、分岐なしで1本のクエリにまとめる
  const rows = await sql<SubscriberRow>`
    select id, email, status, source, created_at, unsubscribed_at
      from subscribers
     where (${q}::text is null or email like ${q}::text escape '\\')
       and (${status}::text is null or status = ${status}::text)
     order by created_at desc
     limit ${perPage} offset ${offset}
  `;

  const counted = await sql<{ count: number }>`
    select count(*)::int as count
      from subscribers
     where (${q}::text is null or email like ${q}::text escape '\\')
       and (${status}::text is null or status = ${status}::text)
  `;

  return { rows, total: counted[0]?.count ?? 0 };
}

export interface ManualAddResult {
  /** 新しく名簿に入った数 */
  added: number;
  /** すでに載っていて何もしなかった数 */
  skipped: number;
  /** アドレスとして読めなかった行 */
  invalid: string[];
}

/**
 * 貼り付けた文字列からメールアドレスを拾う。
 *
 * スプレッドシートからコピーすると、タブ区切り・カンマ区切り・
 * 「名前 <mail@example.com>」など形はまちまちになる。
 * 区切り方を利用者に強いるより、アドレスらしいものを拾う方が早い。
 */
export function extractEmails(text: string): { emails: string[]; invalid: string[] } {
  const emails: string[] = [];
  const invalid: string[] = [];

  for (const line of text.split(/[\n\r]+/)) {
    if (!line.trim()) continue;

    const found = line.match(/[^\s,;<>"']+@[^\s,;<>"']+/g) ?? [];
    const valid = found.map(normalizeEmail).filter(isValidEmail);

    if (valid.length === 0) invalid.push(line.trim().slice(0, 80));
    else emails.push(...valid);
  }

  return { emails: [...new Set(emails)], invalid };
}

/**
 * 管理画面からの手動登録。
 *
 * 本人が確認リンクを踏む流れを通らないので、状態は最初から active にする。
 * すでに同意をもらっている相手（過去の名簿からの移行、イベントで直接もらった
 * アドレスなど）を入れるための口で、知らない相手を入れる用途ではない。
 *
 * すでに載っているアドレスには触らない。解除済みの人を
 * 貼り直しで復活させてしまわないため。
 */
export async function addSubscribers(rawEmails: string[]): Promise<ManualAddResult> {
  const sql = getSql();

  const emails = [...new Set(rawEmails.map(normalizeEmail).filter(isValidEmail))];
  if (emails.length === 0) return { added: 0, skipped: 0, invalid: [] };

  const tokens = emails.map(() => generateToken());

  const inserted = await sql<{ email: string }>`
    insert into subscribers (email, status, unsub_token, source, consented_at)
    select x.email, 'active', x.token, 'manual', now()
      from unnest(${emails}::text[], ${tokens}::text[]) as x(email, token)
    on conflict (email) do nothing
    returning email
  `;

  return {
    added: inserted.length,
    skipped: emails.length - inserted.length,
    invalid: [],
  };
}

/** 管理画面用の集計 */
export async function countByStatus(): Promise<Record<string, number>> {
  const sql = getSql();
  const rows = await sql<{ status: string; count: number }>`
    select status, count(*)::int as count from subscribers group by status
  `;
  return Object.fromEntries(rows.map((r) => [r.status, r.count]));
}

// ===== 送信サービスからの通知（webhook）=====

/**
 * 宛先不明（ハードバウンス）。以後は配信対象から外す。
 *
 * 一度でも「存在しない」と言われたアドレスに送り続けると、
 * 送信元ドメイン全体の評価が下がり、他の全員への到達率が落ちる。
 * ここを怠ると数ヶ月で通常のメールまで届かなくなるので、必ず自動で外す。
 */
export async function markBounced(rawEmail: string, reason: string): Promise<boolean> {
  const sql = getSql();
  const email = normalizeEmail(rawEmail);
  const rows = await sql<{ id: string }>`
    update subscribers
       set status = 'bounced',
           status_reason = ${reason.slice(0, 500)},
           updated_at = now()
     where email = ${email}
       and status in ('active', 'pending')
     returning id
  `;
  return rows.length > 0;
}

/**
 * 迷惑メール報告。以後は配信対象から外し、再登録も受け付けない。
 * （registerSubscriber が complained を弾く）
 */
export async function markComplained(rawEmail: string, reason: string): Promise<boolean> {
  const sql = getSql();
  const email = normalizeEmail(rawEmail);
  const rows = await sql<{ id: string }>`
    update subscribers
       set status = 'complained',
           status_reason = ${reason.slice(0, 500)},
           unsubscribed_at = coalesce(unsubscribed_at, now()),
           updated_at = now()
     where email = ${email}
       and status <> 'complained'
     returning id
  `;
  return rows.length > 0;
}

/** 送信サービス側の解除リンクから解除された */
export async function unsubscribeByEmail(rawEmail: string): Promise<boolean> {
  const sql = getSql();
  const email = normalizeEmail(rawEmail);
  const rows = await sql<{ id: string }>`
    update subscribers
       set status = 'unsubscribed',
           unsubscribed_at = now(),
           updated_at = now()
     where email = ${email}
       and status in ('active', 'pending')
     returning id
  `;
  return rows.length > 0;
}
