import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { getPodcast } from '@/lib/podcast';

/**
 * /podcast の OGP 画像（1200×630）。
 * 左に番組アートワーク、右に番組名と話数。アートワークと話数は RSS から取るので、
 * 差し替えや新しい回の配信が 1 時間以内に自動で反映される。
 */
export const runtime = 'nodejs';
export const revalidate = 3600;
export const alt = 'SAL Radio — 釣りと身体とものづくりの雑談';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const FALLBACK_TITLE = 'SAL Radio';
const FALLBACK_TAGLINE = '釣りと身体とものづくりの雑談';

/**
 * RSS のアートワーク URL をそのまま使う（画像の取得と縮小は ImageResponse が行う）。
 * sharp をここで読み込むと、ページ本体の関数がこのファイルの設定（alt・size）を読むときに
 * sharp まで読み込もうとして本番で 500 になる。そのため画像処理ライブラリは使わない。
 */
function artworkUrl(url: string): string | null {
  return /^https:\/\//.test(url) ? url : null;
}

export default async function Image() {
  const [show, font] = await Promise.all([
    getPodcast(),
    readFile(path.join(process.cwd(), 'lib/eyecatch/fonts/NotoSansJP-Bold.ttf')),
  ]);

  // 「SAL Radio｜釣りと身体とものづくりの雑談」を番組名とキャッチに分ける
  const [title, tagline] = (show?.title ?? `${FALLBACK_TITLE}｜${FALLBACK_TAGLINE}`)
    .split(/[｜|]/)
    .map((s) => s.trim());
  const episodes = show?.episodes.length ?? 0;
  const artwork = artworkUrl(show?.image ?? '');

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#141414', color: '#fff', fontFamily: 'Noto Sans JP' }}>
        {artwork ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={artwork} width={630} height={630} alt="" style={{ width: 630, height: 630, objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 630, height: 630, background: '#222' }} />
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 52px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* 声の波形を思わせる 3 本線 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 18, borderRadius: 3, background: '#ff764d' }} />
              <div style={{ width: 6, height: 30, borderRadius: 3, background: '#ff764d' }} />
              <div style={{ width: 6, height: 22, borderRadius: 3, background: '#ff764d' }} />
            </div>
            <span style={{ fontSize: 22, letterSpacing: 4, color: '#ff764d' }}>PODCAST</span>
          </div>
            <span style={{ fontSize: 20, color: '#777' }}>shinealight.jp</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ fontSize: 76, lineHeight: 1.05, letterSpacing: -1 }}>{title || FALLBACK_TITLE}</div>
            <div style={{ fontSize: 32, lineHeight: 1.4, color: '#d8d8d8' }}>{tagline || FALLBACK_TAGLINE}</div>
            <div style={{ fontSize: 22, lineHeight: 1.6, color: '#9a9a9a' }}>徳島の限界集落から、散歩しながら録る</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', fontSize: 22, color: '#9a9a9a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {episodes > 0 && (
                <span style={{ padding: '6px 16px', borderRadius: 999, background: '#ff764d', color: '#fff', fontSize: 22 }}>
                  {episodes} episodes
                </span>
              )}
              <span>Spotify で配信中</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Noto Sans JP', data: font, weight: 700, style: 'normal' }],
    }
  );
}
