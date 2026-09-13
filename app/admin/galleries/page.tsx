import Link from 'next/link';
import { listGalleries } from '@/lib/gallery';
import { isDbConfigured } from '@/lib/db';
import { setGalleryFree } from './actions';
import styles from '../admin.module.css';

export const metadata = {
  title: { absolute: 'Memento | Shine a Light' },
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

/**
 * 限定ギャラリー（外貨）の一覧。
 * 撮ってあげた人に渡す URL と、現金・PayPal 後に渡す解放 URL をここから取れる。
 * 追加は `npm run gallery:new`（data/galleries/<token>.json と public/g/<token>/ が生成される）。
 */
export default async function AdminGalleriesPage() {
  const galleries = await listGalleries();
  const canToggle = isDbConfigured();

  return (
    <>
      <main className={styles.main}>
        <div className={styles.pageTitleRow}>
          <h1 className={styles.pageTitle}>
            メメント
            <span className={styles.count}>{galleries.length}件</span>
          </h1>
        </div>
        <p style={{ fontSize: 13, color: '#a0a0a0', margin: '0 0 24px', lineHeight: 1.7 }}>
          撮ってあげた人に「公開 URL」を渡す。ウェブサイズは無料、原本は Stripe で購入。
          現金・PayPal でもらった場合は「解放 URL」を渡すと原本がダウンロードできる。
          「無料配布にする」を押すと、そのギャラリーは原本も無料で配れる（購入ボタンが消える）。
          追加はターミナルで <code style={{ color: '#fff' }}>npm run gallery:new -- &lt;写真…&gt; --title &quot;…&quot; --place &quot;…&quot; [--free]</code>
        </p>

        {galleries.length === 0 ? (
          <p className={styles.emptyState}>ギャラリーがまだありません。</p>
        ) : (
          <div className={styles.list}>
            {galleries.map((g) => {
              const publicPath = `/g/${g.token}`;
              const unlockPath = `${publicPath}?unlock=${g.unlockKey}`;
              const first = g.photos[0];
              return (
                <div key={g.token} className={styles.item}>
                  <div className={styles.thumb}>
                    {first ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={first.preview.jpg} alt="" loading="lazy" decoding="async" className={styles.thumbImg} />
                    ) : (
                      <span className={styles.thumbEmpty}>—</span>
                    )}
                  </div>
                  <div className={styles.info}>
                    <div className={styles.meta}>
                      <time className={styles.date}>{g.date}</time>
                      <span className={styles.catTag}>{g.photos.length}枚</span>
                      {g.free ? (
                        <span className={styles.futureBadge}>無料配布</span>
                      ) : (
                        <span className={styles.catTag}>
                          US${g.price.single}/枚 · US${g.price.all}/全部
                        </span>
                      )}
                    </div>
                    <Link href={publicPath} target="_blank" className={styles.title}>
                      {g.title}
                    </Link>
                    <div style={{ fontSize: 12, color: '#a0a0a0', marginTop: 2 }}>{g.place}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                      <Link href={publicPath} target="_blank" className={styles.actionBtn}>公開 URL ↗</Link>
                      <Link href={unlockPath} target="_blank" className={styles.actionBtn}>解放 URL ↗</Link>
                      {canToggle && (
                        <form action={setGalleryFree}>
                          <input type="hidden" name="token" value={g.token} />
                          <input type="hidden" name="free" value={g.free ? '0' : '1'} />
                          <button type="submit" className={styles.actionBtn}>
                            {g.free ? '有料に戻す' : '無料配布にする'}
                          </button>
                        </form>
                      )}
                      <code style={{ fontSize: 11, color: '#777', alignSelf: 'center', userSelect: 'all' }}>{publicPath}</code>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
