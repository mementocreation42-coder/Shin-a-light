import { getSql, isDbConfigured } from '@/lib/db';

/**
 * サイト内の「差し替えられる画像スロット」。
 * /admin/pro-images でメディアから選び直せる。DB に行が無ければ defaultUrl が使われる。
 */
export interface SiteImageSlot {
    /** DB のキー。変えると保存済みの差し替えが外れるので変えない */
    slot: string;
    /** 管理画面に出す名前 */
    label: string;
    /** どこに出る画像か */
    note: string;
    defaultUrl: string;
}

export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [
    // /pro 索引カード
    { slot: 'pro-index-visual', label: '索引カード：映像・写真', note: '/pro の4枚カード（緑）', defaultUrl: '/images/photos/DSC00161.jpg' },
    { slot: 'pro-index-systems', label: '索引カード：システム', note: '/pro の4枚カード（青）', defaultUrl: '/images/photos/DSC00066.jpg' },
    { slot: 'pro-index-hojokin', label: '索引カード：補助金', note: '/pro の4枚カード（黄）', defaultUrl: '/images/photos/DJI_0005.jpg' },
    { slot: 'pro-index-approach', label: '索引カード：考え方', note: '/pro の4枚カード（紫）', defaultUrl: '/images/photos/DJI_0017.jpg' },
    { slot: 'pro-index-ai', label: '索引カード：AI教室', note: '/pro の索引カード（コーラル）', defaultUrl: '/images/photos/DSC00109.jpg' },
    // /pro 映像と写真は、続けてこそ効く
    { slot: 'pro-visual-box', label: 'ビジュアル戦略ボックス', note: '/pro「映像と写真は、続けてこそ効く」の写真', defaultUrl: '/images/photos/DJI_0012.jpg' },
    // /pro 進め方 5ステップ
    { slot: 'pro-step-01', label: '進め方 01 きく', note: '/pro「進め方」1枚目', defaultUrl: '/images/photos/DSC00104.jpg' },
    { slot: 'pro-step-02', label: '進め方 02 たてる', note: '/pro「進め方」2枚目', defaultUrl: '/images/photos/DJI_0111.jpg' },
    { slot: 'pro-step-03', label: '進め方 03 つくる', note: '/pro「進め方」3枚目', defaultUrl: '/images/photos/DSC00057.jpg' },
    { slot: 'pro-step-04', label: '進め方 04 とどける', note: '/pro「進め方」4枚目', defaultUrl: '/images/photos/DJI_0064.jpg' },
    { slot: 'pro-step-05', label: '進め方 05 つづける', note: '/pro「進め方」5枚目', defaultUrl: '/images/photos/DJI_0007.jpg' },
    // /pro つくる人
    { slot: 'pro-profile', label: 'つくる人：ポートレート', note: '/pro「つくる人」のプロフィール写真', defaultUrl: '/images/profile.jpg' },
    // /pro/visual 写真帯
    { slot: 'visual-strip-1', label: '/pro/visual 写真帯 1', note: 'ビジュアル戦略解説ページの3枚帯・左', defaultUrl: '/images/photos/DSC00161.jpg' },
    { slot: 'visual-strip-2', label: '/pro/visual 写真帯 2', note: 'ビジュアル戦略解説ページの3枚帯・中央', defaultUrl: '/images/photos/DJI_0007.jpg' },
    { slot: 'visual-strip-3', label: '/pro/visual 写真帯 3', note: 'ビジュアル戦略解説ページの3枚帯・右', defaultUrl: '/images/photos/DSC00104.jpg' },
    // A面 ホーム
    { slot: 'about-profile', label: 'ホーム About：プロフィール写真', note: 'トップページ About セクションの写真', defaultUrl: '/images/profile.jpg' },
];

/** slot → 表示に使う URL。DB の差し替えがあればそれ、無ければデフォルト */
export async function getSiteImages(): Promise<Record<string, string>> {
    const urls: Record<string, string> = {};
    for (const s of SITE_IMAGE_SLOTS) urls[s.slot] = s.defaultUrl;

    // DB 未設定（初期セットアップ中など）でもページは既定画像で成立させる
    if (!isDbConfigured()) return urls;

    try {
        const sql = getSql();
        const rows = await sql<{ slot: string; url: string }>`select slot, url from site_images`;
        for (const row of rows) {
            if (row.slot in urls && row.url) urls[row.slot] = row.url;
        }
    } catch (err) {
        // テーブル未作成などは既定画像で継続（画像が理由でページを落とさない）
        console.error('[siteImages] read failed:', err);
    }
    return urls;
}
