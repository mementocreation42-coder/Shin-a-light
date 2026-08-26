-- サイト内の画像スロット（/pro の索引カード・進め方の写真など）の差し替え先。
-- 行が無いスロットはコード側のデフォルト画像が使われる。

create table if not exists site_images (
  -- スロットID。lib/siteImages.ts の SITE_IMAGE_SLOTS と対応する
  slot        text primary key,
  url         text not null,
  alt         text not null default '',
  updated_at  timestamptz not null default now()
);
