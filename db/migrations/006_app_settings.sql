-- アプリ全体の小さな設定（key-value）。
-- Vercel の環境変数を触れない場面でも、DB 側で設定を差し替えられるようにする。
-- 例: contact_to = お問い合わせフォームの宛先メールアドレス

create table if not exists app_settings (
  key         text primary key,
  value       text not null,
  updated_at  timestamptz not null default now()
);
