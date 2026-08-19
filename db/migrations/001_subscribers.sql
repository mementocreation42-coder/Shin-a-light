-- 段階1: 購読者名簿
-- Googleスプレッドシート(GAS)からの移行先。

create table if not exists subscribers (
  id            uuid primary key default gen_random_uuid(),

  -- 小文字・trim 済みのものだけを入れる（正規化はアプリ側の normalizeEmail が担当）
  email         text not null unique,

  -- pending      : ダブルオプトイン待ち（段階2で使用）
  -- active       : 配信対象
  -- unsubscribed : 本人が解除
  -- bounced      : 宛先不明。二度と送らない
  -- complained   : 迷惑メール報告。二度と送らない
  status        text not null default 'active'
                 check (status in ('pending','active','unsubscribed','bounced','complained')),

  -- 確認メール用。使い捨て。
  confirm_token      text unique,
  confirm_sent_at    timestamptz,

  -- 解除リンク用。ログイン不要で解除できるよう恒久的に保持する。
  unsub_token   text not null unique,

  -- 同意の証跡（特定電子メール法）
  source        text,          -- 登録元パス。例: /newsletter
  ip_address    text,
  user_agent    text,
  consented_at  timestamptz,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unsubscribed_at timestamptz
);

-- 配信対象の抽出はこれが効く
create index if not exists subscribers_status_idx on subscribers (status);

-- 興味タグ。段階1では書き込むだけで、絞り込み配信には使わない。
create table if not exists subscriber_tags (
  subscriber_id uuid not null references subscribers(id) on delete cascade,
  tag           text not null,
  primary key (subscriber_id, tag)
);
