'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/login/actions';
import styles from '@/app/admin/admin.module.css';
import { ADMIN_NAV, isItemActive, resolveActive } from './adminNav';

/** 各ページが HeaderActions で差し込むボタンの受け口の id */
export const HEADER_ACTIONS_ID = 'admin-header-actions';

/**
 * 管理画面の共通ヘッダー（2 段）。
 * 上段: ロゴ ＋ グループ ＋ ページ固有のボタン ＋ ログアウト
 * 下段: 開いているグループの画面タブ ＋ 公開ページへのリンク
 */
export default function AdminHeader() {
  const pathname = usePathname() ?? '/admin';
  const { group: activeGroup, item: activeItem } = resolveActive(pathname);

  return (
    <header className={styles.header}>
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          {/* ロゴは管理トップへ。公開サイトへは右側の「サイト ↗」から */}
          <Link href="/admin" className={styles.logo}>SAL</Link>
          <span className={styles.logoBadge}>ADMIN</span>
          <nav className={styles.nav} aria-label="管理メニュー">
            {ADMIN_NAV.map((group) => {
              const active = group.key === activeGroup.key;
              return (
                <Link
                  key={group.key}
                  href={group.items[0].href}
                  className={`${styles.navTab} ${active ? styles.navTabActive : ''}`}
                  aria-current={active ? 'true' : undefined}
                >
                  {group.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className={styles.headerRight}>
          {/* ページ固有のボタン（HeaderActions がここに差し込む） */}
          <div id={HEADER_ACTIONS_ID} className={styles.headerActions} />
          <Link href="/" target="_blank" className={styles.siteLink}>
            <span className={styles.siteLinkText}>サイト</span> ↗
          </Link>
          <form action={logout}>
            <button type="submit" className={styles.logoutBtn}>ログアウト</button>
          </form>
        </div>
      </div>

      <div className={styles.subnav}>
        {activeGroup.items.map((item) => {
          const active = isItemActive(item, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.subTab} ${active ? styles.subTabActive : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {item.label}
            </Link>
          );
        })}
        {activeItem?.publicHref && (
          <Link href={activeItem.publicHref} target="_blank" className={styles.subnavPublic}>
            公開ページを見る ↗
          </Link>
        )}
      </div>
    </header>
  );
}
