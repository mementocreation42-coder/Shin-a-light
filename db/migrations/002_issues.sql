-- 段階3: 配信する号（原稿）

create table if not exists issues (
  id          uuid primary key default gen_random_uuid(),

  subject     text not null default '',
  -- 受信箱の一覧で件名の隣に出る文。空なら本文の先頭から作る
  preheader   text not null default '',
  body_md     text not null default '',

  -- draft    : 下書き。いつでも編集・削除できる
  -- sending  : 配信中。編集させない
  -- sent     : 配信済み。編集させない
  status      text not null default 'draft'
               check (status in ('draft','sending','sent')),

  -- 配信時点の対象人数。あとから名簿が増減しても記録は動かさない
  recipient_count int,

  sent_at     timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 一覧は常に新しい順
create index if not exists issues_created_at_idx on issues (created_at desc);
