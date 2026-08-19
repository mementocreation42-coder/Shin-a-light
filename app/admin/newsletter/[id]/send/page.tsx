import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isDbConfigured } from '@/lib/db';
import { getIssue } from '@/lib/issues';
import { getDeliveryStats, listFailures, countOpened, BATCH_LIMIT, type FailureRow } from '@/lib/delivery';
import { renderIssueEmail } from '@/lib/email/templates';
import { currentProvider } from '@/lib/email/mailer';
import NewsletterShell, { DbSetupNotice } from '@/components/admin/NewsletterShell';
import SendPanel from '@/components/admin/SendPanel';
import styles from '../../../admin.module.css';
import nl from '../../newsletter.module.css';

export const metadata = {
  title: { absolute: 'Send Issue | Shine a Light' },
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

const PROVIDER_LABEL: Record<string, string> = {
  resend: 'Resend',
  brevo: 'Brevo',
  outbox: '未設定',
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

/**
 * 配信ページ。
 *
 * 編集画面とは分けている。一斉配信は取り消せない操作なので、
 * 「書く」画面のボタンの並びに混ぜず、送る前に何が起きるかを
 * 一枚に並べてから押させる。
 */
export default async function SendIssuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isDbConfigured()) {
    return <NewsletterShell breadcrumb="配信"><DbSetupNotice /></NewsletterShell>;
  }

  const issue = await getIssue(id);
  if (!issue) notFound();

  let stats: { sent: number; failed: number; remaining: number };
  let failures: FailureRow[];
  let opened: number;
  try {
    [stats, failures, opened] = await Promise.all([getDeliveryStats(id), listFailures(id), countOpened(id)]);
  } catch (error) {
    // 接続はできても deliveries が無い（未マイグレーション）ならここに来る
    console.error('[Newsletter send]', error);
    return <NewsletterShell breadcrumb="配信"><DbSetupNotice /></NewsletterShell>;
  }

  const provider = currentProvider();
  const ready = Boolean(issue.subject.trim() && issue.body_md.trim());

  // 実際に送るものと同じ組版で見せる。解除リンクだけはダミー。
  const { html } = renderIssueEmail({
    subject: issue.subject || '（件名未設定）',
    preheader: issue.preheader,
    bodyMd: issue.body_md,
    unsubUrl: '#',
  });

  return (
    <NewsletterShell
      breadcrumb={issue.subject || '（件名未設定）'}
      actions={
        <Link href={`/admin/newsletter/${issue.id}`} className={styles.ghostBtn}>
          編集に戻る
        </Link>
      }
    >
      <div className={styles.pageTitleRow}>
        <h1 className={styles.pageTitle}>配信</h1>
      </div>

      <div className={nl.statGrid}>
        <div className={nl.statCard}>
          <span className={nl.statValue}>{stats.remaining.toLocaleString()}</span>
          <span className={nl.statLabel}>これから送る</span>
        </div>
        <div className={nl.statCard}>
          <span className={`${nl.statValue} ${stats.sent === 0 ? nl.statValueMuted : ''}`}>
            {stats.sent.toLocaleString()}
          </span>
          <span className={nl.statLabel}>送信済み</span>
        </div>
        <div className={nl.statCard}>
          <span className={`${nl.statValue} ${stats.failed === 0 ? nl.statValueMuted : ''}`}>
            {stats.failed.toLocaleString()}
          </span>
          <span className={nl.statLabel}>失敗</span>
        </div>
        {/* 開封は送信サービスの通知（webhook）から入る。届いていない間は 0 のまま。
            Apple のプライバシー保護などで水増しされるので目安として見る */}
        <div className={nl.statCard}>
          <span className={`${nl.statValue} ${opened === 0 ? nl.statValueMuted : ''}`}>
            {opened.toLocaleString()}
            {stats.sent > 0 && opened > 0 && (
              <span className={nl.statSub}> ({Math.round((opened / stats.sent) * 100)}%)</span>
            )}
          </span>
          <span className={nl.statLabel}>開封（目安）</span>
        </div>
        <div className={nl.statCard}>
          <span className={nl.statValue} style={{ fontSize: 15, lineHeight: 1.9 }}>
            {PROVIDER_LABEL[provider] ?? provider}
          </span>
          <span className={nl.statLabel}>送信サービス</span>
        </div>
      </div>

      <div className={nl.editorGrid}>
        {/* 左: 送る前の確認と実行 */}
        <div>
          <div className={nl.field}>
            <span className={nl.label}>送るもの</span>
            <dl className={nl.sendSummary}>
              <dt>件名</dt>
              <dd className={issue.subject ? '' : nl.sendMissing}>
                {issue.subject || '未設定'}
              </dd>
              <dt>プレヒーダー</dt>
              <dd>{issue.preheader || '（本文の先頭が使われます）'}</dd>
              <dt>本文</dt>
              <dd className={issue.body_md.trim() ? '' : nl.sendMissing}>
                {issue.body_md.trim() ? `${issue.body_md.length.toLocaleString()}文字` : '未入力'}
              </dd>
              <dt>宛先</dt>
              <dd>購読が確認済み（active）の全員</dd>
              {issue.sent_at && (
                <>
                  <dt>初回配信</dt>
                  <dd>{formatDateTime(issue.sent_at)}</dd>
                </>
              )}
            </dl>
          </div>

          <div className={nl.field}>
            <span className={nl.label}>実行</span>
            <SendPanel
              issueId={issue.id}
              remaining={stats.remaining}
              provider={provider}
              batchLimit={BATCH_LIMIT}
              ready={ready}
              done={issue.status === 'sent'}
            />
            <p className={nl.hint}>
              送信前に、編集画面から自分宛てのテスト送信で実物を確かめてください。
              配信を始めるとこの号は編集できなくなります。
            </p>
          </div>

          {failures.length > 0 && (
            <div className={nl.field}>
              <span className={nl.label}>届かなかった宛先</span>
              <ul className={nl.failList}>
                {failures.map((f) => (
                  <li key={f.email} className={nl.failRow}>
                    <span className={nl.subEmail}>{f.email}</span>
                    <time className={styles.date}>{formatDateTime(f.attempted_at)}</time>
                    <span className={nl.failReason}>{f.error ?? '不明なエラー'}</span>
                  </li>
                ))}
              </ul>
              <p className={nl.hint}>
                もう一度「配信する」を押すと、この人たちにだけ送り直します。
              </p>
            </div>
          )}
        </div>

        {/* 右: 実際に届く見た目 */}
        <div>
          <div className={nl.previewHead}>
            <span className={nl.label} style={{ margin: 0 }}>届くメール</span>
          </div>
          <iframe
            title="配信するメール"
            srcDoc={html}
            sandbox=""
            className={nl.previewFrame}
          />
        </div>
      </div>
    </NewsletterShell>
  );
}
