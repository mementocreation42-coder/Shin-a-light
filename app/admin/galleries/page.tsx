import Link from 'next/link';
import { listGalleries } from '@/lib/gallery';
import { isDbConfigured } from '@/lib/db';
import PublishToSite from '@/components/admin/PublishToSite';
import { setGalleryFree } from './actions';
import styles from '../admin.module.css';

export const metadata = {
  title: { absolute: 'Memento | Shine a Light' },
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

/**
 * メメント ＝ 撮ってあげた人に渡す「お渡しギャラリー」。
 * 作成はターミナル（npm run gallery:new）。ここでは URL を渡す・無料/有料を切り替える・
 * 気に入った写真だけサイトの作例（/photos の MEMENTO）に公開する、の 3 つをやる。
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

        {/* 使い分けと作り方 */}
        <section style={{ background: '#232323', border: '1px solid #333', borderRadius: 12, padding: '14px 16px', marginBottom: 24, fontSize: 12.5, color: '#a0a0a0', lineHeight: 1.8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
            <div>
              <b style={{ color: '#fff' }}>公開フォト</b>
              <div>サイトに載せる作例。<Link href="/admin/photos" style={{ color: '#ddd' }}>公開フォト</Link> からアップ、または下の「サイトに公開」で昇格</div>
            </div>
            <div>
              <b style={{ color: '#fff' }}>お渡し・無料</b>
              <div>コードを渡す。原本もそのまま持ち帰れる。「無料配布にする」か <code style={{ color: '#ddd' }}>--free</code></div>
            </div>
            <div>
              <b style={{ color: '#fff' }}>お渡し・有料</b>
              <div>コードを渡す。ウェブサイズは無料、原本は Stripe で購入。現金なら「解放 URL」を渡す</div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #333', paddingTop: 10 }}>
            <b style={{ color: '#fff' }}>作り方</b>　Mac で現像した JPEG をまとめて：
            <code style={{ display: 'block', marginTop: 4, color: '#ddd', fontSize: 12 }}>
              npm run gallery:new -- ~/写真フォルダ --title &quot;Ikumi, morning&quot; --place &quot;Ikumi Beach, Tokushima&quot; [--free] [--single 20 --all 60]
            </code>
            できた <code>data/galleries</code> と <code>public/g</code> をコミットしてデプロイすると、ここに並ぶ。
          </div>
        </section>

        {galleries.length === 0 ? (
          <p className={styles.emptyState}>ギャラリーがまだありません。</p>
        ) : (
          <div className={styles.list}>
            {galleries.map((g) => {
              const publicPath = `/g/${g.token}`;
              const unlockPath = `${publicPath}?unlock=${g.unlockKey}`;
              const first = g.photos[0];
              return (
                <div key={g.token} className={styles.item} style={{ alignItems: 'flex-start' }}>
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
                        <span className={styles.futureBadge}>お渡し・無料</span>
                      ) : (
                        <span className={styles.catTag}>
                          お渡し・有料 US${g.price.single}/枚 · US${g.price.all}/全部
                        </span>
                      )}
                      {(g.published?.length ?? 0) > 0 && (
                        <span className={styles.draftBadge}>作例 {g.published!.length} 枚公開中</span>
                      )}
                    </div>
                    <Link href={publicPath} target="_blank" className={styles.title}>
                      {g.title}
                    </Link>
                    <div style={{ fontSize: 12, color: '#a0a0a0', marginTop: 2 }}>{g.place}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10, alignItems: 'center' }}>
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
                      <code style={{ fontSize: 11, color: '#777', userSelect: 'all' }}>コード {g.token}</code>
                    </div>
                    <PublishToSite gallery={g} />
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
