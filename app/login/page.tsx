import LoginClient from './LoginForm';

/**
 * ログインページ（サーバー側）。
 * 開発環境（next dev）でのみ、.env.local の ADMIN_PASSWORD をパスワード欄に入れておく。
 * 本番ビルドでは絶対に渡さない ＝ HTML にパスワードが載らない。
 */
export default function LoginPage() {
  const devPassword = process.env.NODE_ENV === 'development' ? process.env.ADMIN_PASSWORD : undefined;
  return <LoginClient devPassword={devPassword} />;
}
