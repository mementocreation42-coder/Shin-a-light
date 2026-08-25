import Link from 'next/link';
import { redirect } from 'next/navigation';
import { countByStatus } from '@/lib/newsletter';
import { listIssues, createIssue, usingFileStore, type IssueSummary } from '@/lib/issues';
import NewsletterShell, { DbSetupNotice } from '@/components/admin/NewsletterShell';
import SubscriberSection, { parseSubscriberParams } from '@/components/admin/SubscriberSection';
import styles from '../admin.module.css';
import nl from './newsletter.module.css';

export const metadata = {
  title: { absolute: 'Newsletter | Shine a Light' },
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
}

/** 空の号を作ってそのままエディタへ。下書きなので保存しなくても害はない */
async function newIssue() {
  'use server';
  const issue = await createIssue();
  redirect(`/admin/newsletter/${issue.id}`);
}

const STATUS_LABEL: Record<string, string> = {
  draft: '下書き',
  sending: '配信中',
  sent: '配信済み',
};

export default async function NewsletterPage({
  searchParams,
}: {
  // 名簿の絞り込み。同じ画面に埋め込んだ登録者一覧が読む
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  // 名簿と配信は DB でしか動かないが、原稿はファイルにも書ける。
  // DB が無い間は「書く」だけを開けておき、名簿は出さない。
  const fileMode = usingFileStore();
  const subscriberParams = parseSubscriberParams(await searchParams);

  let counts: Record<string, number> = {};
  let issues: IssueSummary[];
  try {
    [counts, issues] = fileMode
      ? [{}, await listIssues()]
      : await Promise.all([countByStatus(), listIssues()]);
  } catch (error) {
    // 接続はできても未マイグレーションならここに来る
    console.error('[Newsletter admin]', error);
    return <NewsletterShell><DbSetupNotice /></NewsletterShell>;
  }

  const active = counts.active ?? 0;
  const pending = counts.pending ?? 0;
  const off = counts.unsubscribed ?? 0;
  const dead = (counts.bounced ?? 0) + (counts.complained ?? 0);

  return (
    <NewsletterShell
      actions={
        <>
          <Link href="/admin/newsletter/templates" className={styles.ghostBtn}>
            自動送信メール
          </Link>
          <form action={newIssue}>
            <button type="submit" className={styles.primaryBtn}>
              <span className={styles.btnIcon}>＋</span>
              <span className={styles.btnText}>新しい号</span>
            </button>
          </form>
        </>
      }
    >
      {fileMode && (
        <p className={nl.fileModeNotice}>
          原稿は <code>content/newsletter/</code> にファイルとして保存しています。
          名簿と配信はデータベースを繋いだあとで使えるようになります。
        </p>
      )}

      {/* 名簿の数字は DB が無い間も 0 として出す。カードごと隠すと、
          いま何人なのかが分からないまま書くことになる */}
      <div className={nl.statGrid}>
        <Link href="/admin/newsletter?status=active#subscribers" className={`${nl.statCard} ${nl.statCardLink}`}>
          <span className={nl.statValue}>{active.toLocaleString()}</span>
          <span className={nl.statLabel}>配信対象</span>
        </Link>
        <Link href="/admin/newsletter?status=pending#subscribers" className={`${nl.statCard} ${nl.statCardLink}`}>
          <span className={`${nl.statValue} ${pending === 0 ? nl.statValueMuted : ''}`}>{pending.toLocaleString()}</span>
          <span className={nl.statLabel}>確認待ち</span>
        </Link>
        <Link href="/admin/newsletter?status=unsubscribed#subscribers" className={`${nl.statCard} ${nl.statCardLink}`}>
          <span className={`${nl.statValue} ${nl.statValueMuted}`}>{off.toLocaleString()}</span>
          <span className={nl.statLabel}>解除済み</span>
        </Link>
        <Link href="/admin/newsletter#subscribers" className={`${nl.statCard} ${nl.statCardLink}`}>
          <span className={`${nl.statValue} ${nl.statValueMuted}`}>{dead.toLocaleString()}</span>
          <span className={nl.statLabel}>不達・苦情</span>
        </Link>
      </div>

      <div className={styles.pageTitleRow}>
        <h1 className={styles.pageTitle}>
          号の一覧
          <span className={styles.count}>{issues.length}件</span>
        </h1>
      </div>

      {issues.length === 0 ? (
        <p className={styles.emptyState}>まだ号がありません。「新しい号」から作成してください。</p>
      ) : (
        <div className={styles.list}>
          {issues.map((issue) => (
            <div
              key={issue.id}
              className={`${styles.item} ${issue.status === 'draft' ? styles.itemDraft : ''}`}
            >
              <div className={styles.info}>
                <div className={styles.meta}>
                  <time className={styles.date}>
                    {formatDate(issue.sent_at ?? issue.created_at)}
                  </time>
                  {issue.status === 'draft' ? (
                    <span className={styles.draftBadge}>下書き</span>
                  ) : (
                    <span className={styles.catTag}>{STATUS_LABEL[issue.status]}</span>
                  )}
                  {issue.recipient_count !== null && (
                    <span className={styles.catTag}>{issue.recipient_count.toLocaleString()}通</span>
                  )}
                </div>
                {issue.status === 'draft' ? (
                  <Link href={`/admin/newsletter/${issue.id}`} className={styles.title}>
                    {issue.subject || '（件名未設定）'}
                  </Link>
                ) : (
                  <Link href={`/admin/newsletter/${issue.id}`} className={`${styles.title} ${styles.titleDraft}`}>
                    {issue.subject || '（件名未設定）'}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 名簿は号の一覧の下。書く導線を先に見せ、確認したいときだけ下まで来る */}
      <SubscriberSection
        page={subscriberParams.page}
        search={subscriberParams.search}
        status={subscriberParams.status}
        enabled={!fileMode}
      />
    </NewsletterShell>
  );
}
