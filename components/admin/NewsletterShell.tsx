import Link from 'next/link';
import AdminNav from '@/components/admin/AdminNav';
import styles from '@/app/admin/admin.module.css';
import nl from '@/app/admin/newsletter/newsletter.module.css';

/** ニュースレター管理の共通の枠。ヘッダーの作りは他の管理画面に合わせている */
export default function NewsletterShell({
  children,
  actions,
  breadcrumb,
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
  /** 一覧より下の階層で出すパンくず */
  breadcrumb?: string;
}) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.logo}>SAL</Link>
          {breadcrumb ? (
            <>
              <Link href="/admin/newsletter" className={styles.breadcrumb}>/ ニュースレター</Link>
              <span className={styles.breadcrumb}>/ {breadcrumb}</span>
            </>
          ) : (
            <>
              <span className={styles.logoBadge}>ADMIN</span>
              <AdminNav />
            </>
          )}
        </div>
        <div className={styles.headerRight}>{actions}</div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

/**
 * DATABASE_URL が未設定のときに出す案内。
 * 名簿は DB にしかないので、繋がるまでは何も表示できない。
 * ここで握らないと管理画面全体が例外で落ちる。
 */
export function DbSetupNotice() {
  return (
    <div className={nl.setupNotice}>
      <h2 className={nl.setupTitle}>データベースが未接続です</h2>
      <p className={nl.setupBody}>
        ニュースレターの名簿と原稿は Postgres に保存します。
        Neon でプロジェクトを作り、接続文字列を <code>.env.local</code> に追加してください。
        追加したあとマイグレーションを流すとこの画面が使えるようになります。
        <code className={nl.setupCode}>{`DATABASE_URL=postgresql://...

node scripts/db-migrate.mjs`}</code>
      </p>
    </div>
  );
}
