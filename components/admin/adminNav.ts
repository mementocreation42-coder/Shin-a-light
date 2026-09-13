/**
 * 管理画面のナビ定義。上段が「グループ」、下段がその中の画面。
 * 画面を足すときはここに 1 行足すだけでよい（ヘッダーは app/admin/layout.tsx が共通で描く）。
 */
export interface AdminNavItem {
  href: string;
  label: string;
  /** 対応する公開ページ。下段の右端に「公開ページを見る ↗」として出す */
  publicHref?: string;
  /** href の前方一致で足りないときの判定（例: /admin は /admin/post* も含む） */
  match?: (pathname: string) => boolean;
}

export interface AdminNavGroup {
  key: string;
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    key: 'home',
    label: 'ホーム',
    items: [{ href: '/admin', label: 'ダッシュボード', match: (p) => p === '/admin' }],
  },
  {
    key: 'write',
    label: '記事',
    items: [
      {
        href: '/admin/posts',
        label: '投稿管理',
        publicHref: '/journal',
        match: (p) => p.startsWith('/admin/post'),
      },
      { href: '/admin/ideas', label: '記事ネタ', publicHref: '/journal' },
    ],
  },
  {
    key: 'photo',
    label: '写真',
    items: [
      { href: '/admin/photos', label: 'フォト管理', publicHref: '/photos' },
      { href: '/admin/galleries', label: 'メメント', publicHref: '/g' },
    ],
  },
  {
    key: 'send',
    label: '届ける',
    items: [{ href: '/admin/newsletter', label: 'ニュースレター', publicHref: '/newsletter' }],
  },
  {
    key: 'site',
    label: 'サイト',
    items: [
      { href: '/admin/site-images', label: 'Proページ編集', publicHref: '/pro' },
      { href: '/admin/tools', label: 'ツールズ', publicHref: '/tools' },
      { href: '/admin/sal-map', label: 'SAL 図' },
    ],
  },
];

export function isItemActive(item: AdminNavItem, pathname: string): boolean {
  if (item.match) return item.match(pathname);
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** いま開いている画面が属するグループと画面。/admin 配下で該当なしなら先頭グループ */
export function resolveActive(pathname: string): { group: AdminNavGroup; item: AdminNavItem | null } {
  for (const group of ADMIN_NAV) {
    const item = group.items.find((i) => isItemActive(i, pathname));
    if (item) return { group, item };
  }
  return { group: ADMIN_NAV[0], item: null };
}
