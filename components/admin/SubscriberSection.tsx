import Link from 'next/link';
import {
  listSubscribers,
  type SubscriberStatus,
  type SubscriberRow,
} from '@/lib/newsletter';
import SubscriberFilters from '@/components/admin/SubscriberFilters';
import SubscriberAdd from '@/components/admin/SubscriberAdd';
import styles from '@/app/admin/admin.module.css';
import nl from '@/app/admin/newsletter/newsletter.module.css';

/**
 * 名簿の一覧。ニュースレター管理トップに埋め込んで使う。
 *
 * 号の一覧と同じ画面に置くのは、書く前に「いま何人に届くのか」を
 * 見に行かなくて済むようにするため。絞り込みは URL に持たせているので、
 * 上の数字カードから状態を指定して飛んでこられる。
 */

export const PER_PAGE = 50;

const VALID_STATUSES: SubscriberStatus[] = [
  'active', 'pending', 'unsubscribed', 'bounced', 'complained',
];

const BADGE: Record<SubscriberStatus, { label: string; className: string }> = {
  active:       { label: '配信対象',     className: 'badgeActive' },
  pending:      { label: '確認待ち',     className: 'badgePending' },
  unsubscribed: { label: '解除済み',     className: 'badgeOff' },
  bounced:      { label: '不達',         className: 'badgeBad' },
  complained:   { label: '迷惑メール報告', className: 'badgeBad' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
}

/** URL の生の文字列から、そのまま問い合わせに使える形にそろえる */
export function parseSubscriberParams(params: {
  page?: string;
  q?: string;
  status?: string;
}) {
  return {
    page: Math.max(parseInt(params.page || '1', 10) || 1, 1),
    search: params.q?.trim() || undefined,
    status: VALID_STATUSES.includes(params.status as SubscriberStatus)
      ? (params.status as SubscriberStatus)
      : undefined,
  };
}

export default async function SubscriberSection({
  page,
  search,
  status,
  enabled = true,
}: {
  page: number;
  search?: string;
  status?: SubscriberStatus;
  /** 名簿を引けるか。DB 未接続のときは問い合わせずに空のまま出す */
  enabled?: boolean;
}) {
  let rows: SubscriberRow[] = [];
  let total = 0;

  if (!enabled) {
    return (
      <section id="subscribers" className={nl.subscriberSection}>
        <div className={styles.pageTitleRow}>
          <h1 className={styles.pageTitle}>
            登録者
            <span className={styles.count}>0件</span>
          </h1>
        </div>
        <SubscriberAdd disabled />
        <p className={styles.emptyState}>
          まだ登録者がいません。データベースを繋ぐと、フォームからの登録がここに入ります。
        </p>
      </section>
    );
  }

  try {
    ({ rows, total } = await listSubscribers({ page, perPage: PER_PAGE, q: search, status }));
  } catch (error) {
    // 接続はできても未マイグレーションならここに来る。
    // 号の一覧まで巻き添えにしないよう、この節だけを案内に差し替える。
    console.error('[Subscribers]', error);
    return (
      <section id="subscribers">
        <div className={styles.pageTitleRow}>
          <h1 className={styles.pageTitle}>登録者</h1>
        </div>
        <p className={styles.emptyState}>
          名簿を読み込めませんでした。マイグレーションが済んでいるか確認してください。
        </p>
      </section>
    );
  }

  const totalPages = Math.max(Math.ceil(total / PER_PAGE), 1);
  const isFiltered = Boolean(search || status);

  // ページ送りに現在の絞り込みを引き継ぐ。同じ画面に号の一覧もあるので、
  // 戻ってきたときに名簿の位置まで飛ばす。
  const pageHref = (target: number) => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (status) params.set('status', status);
    params.set('page', String(target));
    return `/admin/newsletter?${params.toString()}#subscribers`;
  };

  return (
    <section id="subscribers" className={nl.subscriberSection}>
      <div className={styles.pageTitleRow}>
        <h1 className={styles.pageTitle}>
          登録者
          <span className={styles.count}>
            {isFiltered ? `該当 ${total.toLocaleString()}件` : `${total.toLocaleString()}件`}
          </span>
        </h1>
      </div>

      <SubscriberFilters />
      <SubscriberAdd />

      {rows.length === 0 ? (
        <p className={styles.emptyState}>
          {isFiltered ? '条件に一致する登録者がいません。' : 'まだ登録者がいません。'}
        </p>
      ) : (
        <div className={styles.list}>
          {rows.map((row) => {
            const badge = BADGE[row.status];
            return (
              <div key={row.id} className={nl.subRow}>
                <span className={nl.subEmail}>{row.email}</span>
                <span className={`${nl.badge} ${nl[badge.className]}`}>{badge.label}</span>
                {row.source && <span className={nl.subMeta}>{row.source}</span>}
                <time className={nl.subMeta}>{formatDate(row.created_at)}</time>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          {page > 1 && <Link href={pageHref(page - 1)} className={styles.pageBtn}>← 前</Link>}
          <span className={styles.pageInfo}>{page} / {totalPages}</span>
          {page < totalPages && <Link href={pageHref(page + 1)} className={styles.pageBtn}>次 →</Link>}
        </div>
      )}
    </section>
  );
}
