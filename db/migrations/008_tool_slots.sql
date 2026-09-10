-- /tools の枠ごとの本文・写真（管理画面 /admin/tools で編集する）。
-- 行がある枠は、その行の値で data/tools.ts の内容を上書きする（name〜status まで丸ごと）。
-- 行が無い枠、または「元に戻す」で行を消した枠は、コード側の値が使われる。
-- category / addedAtAge は枠の骨格なのでコード側のまま。

create table if not exists tool_slots (
  slot            text primary key,
  name            text not null default '',
  one_line        text not null default '',
  why             text not null default '',
  future          text not null default '',
  weight_g        integer,
  material        text not null default '',
  years           integer,
  source          text not null default '',
  photo           text not null default '',
  photo2          text not null default '',
  link_buy        text not null default '',
  link_podcast    text not null default '',
  link_note       text not null default '',
  link_instagram  text not null default '',
  status          text not null default 'draft',
  updated_at      timestamptz not null default now()
);
