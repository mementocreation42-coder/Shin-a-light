'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/app/admin/admin.module.css';

const TABS = [
  { href: '/admin', label: '投稿管理' },
  { href: '/admin/photos', label: 'フォト管理' },
] as const;

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {TABS.map((tab) => {
        const active =
          tab.href === '/admin'
            ? pathname === '/admin' || pathname.startsWith('/admin/post')
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`${styles.navTab} ${active ? styles.navTabActive : ''}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
