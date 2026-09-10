# /tools を管理画面から編集する（引き継ぎメモ）

最終更新: 2026-09-10

## 仕組み

- 枠の骨格（ID・カテゴリ・開いた年齢）と初期値は `data/tools.ts`。ここは今までどおり
- 本文と写真は DB の `tool_slots`（`db/migrations/008_tool_slots.sql`）で上書きする。行がある枠はその行の値、無い枠はコード側の値で表示（/pro の `site_images` と同じ考え方）
- 読み書きは `lib/toolsStore.ts`。公開ページ（`app/tools/page.tsx`, `app/tools/[slot]/page.tsx`）は `getToolsMerged()` / `getToolMerged()` を通して読む
- 管理画面 `/admin/tools`（一覧）→ `/admin/tools/<枠ID>`（編集）。API は `app/api/admin/tools/route.ts`（GET / PUT / DELETE、管理ログイン必須）
- 保存・リセット時に `/tools` と `/tools/<枠ID>` を `revalidatePath` する。念のため両ページは1時間で作り直す

## 編集できる項目

名前・一言・なぜこれか・どこが「ちょっと未来」か・重量・素材・使用年数・入手先・写真2枚・リンク4つ・状態（下書き／公開／引退）

- 写真はメディアライブラリ（WordPress）から選ぶ。URL が保存される
- コード側の写真パス（`/images/tools/L01.jpg` など）は、`public` にファイルがあるときだけ表示される。無ければカテゴリ色のプレースホルダー
- 「元に戻す」で行を消すと、その枠はコード側の値に戻る

## 本番に出すとき

1. 本番の DB にマイグレーションを当てる: `.env.local` の `DATABASE_URL` を Neon にして `npm run db:migrate`（`008_tool_slots.sql` が入る）
2. デプロイ
3. `/admin/tools` から枠を開いて書く

## 未決

- `data/tools.ts` の TOOL カテゴリの一文「テクノロジーは、」が途中のまま
- 一覧カードの写真は写真1（縦）を 4:3 に切って使っている。カード用に別の写真を持たせるなら列を足す
