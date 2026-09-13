import Link from 'next/link';
import HeaderActions from '@/components/admin/HeaderActions';
import styles from '@/app/admin/admin.module.css';
import nl from '@/app/admin/newsletter/newsletter.module.css';

/** ニュースレター管理の共通の枠。ヘッダーは layout が描くので、ボタンとパンくずだけ足す */
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
    <>
      {actions && <HeaderActions>{actions}</HeaderActions>}
      <main className={styles.main}>
        {breadcrumb && (
          <p className={styles.crumbs}>
            <Link href="/admin/newsletter">ニュースレター</Link> / {breadcrumb}
          </p>
        )}
        {children}
      </main>
    </>
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
