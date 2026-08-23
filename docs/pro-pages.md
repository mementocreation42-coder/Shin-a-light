# /pro ファミリー — 事業向けページの構成（引き継ぎメモ）

最終更新: 2026-08-23（ブランチ `feat/pro-hojokin`）

`/pro` を入口に、専門ページを4つぶら下げる構成。CTA はすべて `/?c=produce#contact` の1本。
価格は全ページ「◯◯万円〜」のプレースホルダ（`data/pro*.ts` の `price`）。**公開前に実数値へ差し替える。**

| パス | 役割 | データ | ページ |
|---|---|---|---|
| `/pro` | 入口。通しで引き受ける範囲・進め方・実績・費用・FAQ。各専門ページへの導線セクション3つ（ビジュアル／システム／補助金） | `data/pro.ts` | `app/pro/page.tsx` |
| `/pro/approach` | 考え方（企画書の公開）。既存 | — | `app/pro/approach/page.tsx` |
| `/pro/visual` | **連続的な映像・写真クリエイション＝ビジュアルコミュニケーション戦略**。年間伴走を本命に | `data/pro-visual.ts` | `app/pro/visual/page.tsx` |
| `/pro/systems` | **各社に合わせたシステム開発**。自動化・巡回通知・見える化・発信の裏側・AI・サービス立ち上げ | `data/pro-systems.ts` | `app/pro/systems/page.tsx` |
| `/pro/hojokin` | 海部郡で動画・Webに使える補助金一覧（→ `docs/hojokin.md`） | `data/hojokin.ts` | `app/pro/hojokin/page.tsx` |

CSS は `app/globals.css` の末尾にページごとのブロック（`.systems-*`, `.visual-*`, `.hojokin-*`）。`/pro` の導線ボックス（`.pro-visual-*`, `.pro-systems-*`, `.pro-hojokin-*`）は FAQ ブロックの直前。共通部品（ヒーロー・共感リスト・進め方・プラン・FAQ・CTA）は既存の `.pro-*` をそのまま使う。

## 見た目の方針 — B面は白（2026-08-23 ユーザー指示）

**A面（ポートフォリオ＝黒）に対して、pro 版は B面＝白でクリーンに。光と影の関係。**

- `app/pro/layout.tsx` が `<div class="b-side">` で包み、`globals.css` の `body:has(.b-side)` でテーマ変数を反転（`--bg-*` / `--text-*` / `--border` / `--accent-orange` を白地用に）。Nav・Footer は変数経由なので自動で白になる
- フローティングナビ（黒いピル）は A面の名残として黒のまま＝白地の中の「影」
- 白地では元の橙 `#ff764d` が薄いので、B面内は `#e4582b`。橙ボタン・バッジの文字は白
- 各ページのヒーロー最上段に `.b-side-mark`（半分黒・半分白の丸＋「B-side of Shine a Light」）
- 暗地前提のハードコード色（`rgba(255,255,255,…)` の罫線、`#4a4a4a` の下線）は `body:has(.b-side)` 配下で上書き。新しい CSS を足すときは変数を使い、ハードコードしない

## トーンの方針（2026-08-23 ユーザー指示）

**LP（`/pro`）があって、その中を細分化して見れる構想。pro 版なので尖りきらず、「この人に任せたらイケる」と思わせる。**

- `/pro` ヒーロー直下に「信頼の3点」（牟岐町と◯年目＝works から自動／自治体・企業・個人事業／企画から運用まで一人）と、4本への索引タイル（`.pro-index`）
- 下層の共感セクションの見出しは「こんな相談から始まることが多いです」（詰問調にしない）。LP だけ「こんなことが起きていませんか」
- 線を引く箇所（向かない依頼・しないこと）は残すが、突き放さず代わりの選択肢を添える（例：「既製品のほうがいい場合も、そうお伝えします」）
- 実績・一貫性・進め方の明確さで信頼をつくる。煽りや断定で尖らせない

## 書くときの約束

- **実例は出典が取れるものだけ。** `/pro/visual` の実例は `data/works.ts` の slug 参照（`VISUAL_WORK_SLUGS`）。年数バッジは `year: '2018-'` のような継続表記から自動計算
- **`/pro/systems` の実例は自社で動かしているものだけ**（メルマガ基盤・CMS＋下書き生成・運用OS・補助金ウォッチ・MitoFlow40）。稼働状況（`status`）は正直に。クライアント案件の社内システムは載せない
- 「斡旋」「保証」と書かない。補助金は「補助金対応」「申請サポート」まで
- ページを増やすときは ①`data/pro-*.ts` ②`app/pro/*/page.tsx` ③globals.css ④`/pro` に導線 ⑤`data/pro.ts` の FAQ ⑥`app/sitemap.ts` の6点セット

## 未決・次にやること

1. 価格の実数値（3ページ×3プラン）。`/pro/visual` は「月◯日の撮影」も要決定
2. `/pro/systems` の実例リンク：CMS と運用OS は公開 URL が無いので `href` なし。見せられる画面ができたら追加
3. ナビへの露出。ヘッダーから Pro リンクは外してある（`66dd577`）ので、今は `/pro` 直リンクか Footer からのみ。露出先を決める
4. OGP 画像は全ページ `/opengraph-image` 共用。ページ別にするなら `app/pro/*/opengraph-image.tsx`
5. 補助金一覧の下書き3行と巡回システム（→ `docs/hojokin.md`）
