# /pro/hojokin — 海部郡で動画・Webに使える補助金（引き継ぎメモ）

元ネタは `hojokin-watch-spec.md`（徳島県南・補助金巡回システムの仕様メモ）。
「国・県・町の補助金を週1で拾い、正規化して Notion に貯め、shinealight.jp に公開する」のうち、
**公開側（一覧ページ・データ型・A4 PDF）を先に作った**のがこのブランチ。巡回（fetch→diff→extract→upsert→notify）は未実装。

最終更新: 2026-08-23

## 状況

- ブランチ `feat/pro-hojokin`（origin/main `66dd577` ベース）
- `tsc` / `eslint` / `next build` 通過。PC・スマホ表示と A4 印刷を確認済み
- 仕様の公開先 `/business/hojokin` は、サイトにすでにある事業向けページ `/pro` に合わせて **`/pro/hojokin`** にした

## 触るファイル

| ファイル | 役割 |
|---|---|
| `data/hojokin.ts` | **データ本体**。1行＝1補助金。型 `Hojokin` と helper（`effectiveStatus` / `publishedHojokin` / `nextCutoff` / `formatYen` / `formatDate`） |
| `app/pro/hojokin/page.tsx` | 一覧ページ。`revalidate = 86400`（締切超過を日次で「終了」に落とす） |
| `app/pro/page.tsx` | `/pro` に「制作費に、補助金を使う」セクション（公募中◯件を `data/hojokin.ts` から算出） |
| `data/pro.ts` | FAQ に「補助金は使えますか」を1問追加 |
| `app/globals.css` | 末尾の `/pro/hojokin` ブロック（画面用）＋ `@media print`（A4 配布用）。`/pro` 用の `.pro-hojokin-*` は FAQ の直前 |
| `app/sitemap.ts` | `/pro/hojokin` を追加 |

## データの書き方（`data/hojokin.ts`）

```ts
{
  id: 'mugi-sogyo-r8',            // 安定ID。Notion upsert のキーにする
  name, level: '国'|'県'|'町', issuer, target, eligibleCosts, rate,
  cap: 300_000, capNote?,         // 円。条件で変わるときは基本額＋capNote
  windowOpens?: 'YYYY-MM-DD', deadline: 'YYYY-MM-DD' | null,
  preDeadline?: { label, date },  // 様式4 など「申請締切より先に閉まる期限」
  windowStatus: '公募中'|'予告'|'終了'|'不明',  // 手入力。deadline 超過は自動で終了に上書き
  contact, video: '○'|'△'|'×'|'未確認', web: 同上,
  notes: string[], sourceUrl (必須), rawDocUrl?, lastChecked, changed?,
  published: boolean,             // false = 下書き。ページに出ない
}
```

ルール（仕様メモから引き継ぎ）
- **出典（sourceUrl）が無い行は作らない**。二次ポータルからの転載禁止。一次資料で確認してから `published: true`
- **○× は人が確定**。巡回（機械）が付けていいのは △ まで
- 「斡旋」と書かない。「補助金対応」「申請サポート」まで
- 要項は年度で変わる。次年度分は `id` を変えて新しい行にする（例 `mugi-sogyo-r9`）

## 2026-08-23 時点の中身（一次資料で確認済み）

| 行 | 状態 | 要点 |
|---|---|---|
| 持続化補助金 一般型 第20回 | 予告 | 2/3・上限50万(+特例)。受付 11/5〜12/15、**商工会の様式4は 12/4**。広報費・ウェブサイト関連費とも **上限30万（税込）・単独申請不可**。HP用動画＝ウェブサイト関連費、宣伝用動画＝広報費 |
| 持続化補助金 創業型 第4回 | 予告 | 2/3・上限200万。日程は一般型と同じ。特定創業支援＋開業が締切から1年以内 |
| 県 企業等採用活動支援 R8 | 公募中 | 1/2・各区分50万。受付 7/1〜11/30。従業員1名以上・ジョブナビ登録・創業1年以上。採用目的限定 |
| 牟岐町 創業促進 R8 | 公募中 | 1/2・上限30万。受付 7/1〜11/2、**4事業程度・先着**。HP制作委託費・チラシ・広告宣伝費が対象。動画は△（産業課に要確認） |
| 県 販路開拓系（非対面 上限10万） | **下書き** | 一次資料を特定できず。見つかったら `published: true` |
| 美波町 / 海陽町 | **下書き** | 未調査 |

仕様メモの「動画は補助額の1/4上限」は古い情報（第20回で30万円上限に変更）。一覧には新しい方を反映済み。

## ローカルで見る

```bash
npm install
npm run dev -- -p 3789
# http://localhost:3789/pro/hojokin
```

`.env.local` は無くてもこのページは動く（他ページ用に main と同じものを置けばよい）。

## A4 PDF（商工会・役場への手土産）

印刷 CSS が入っているので、ブラウザの「印刷 → PDF に保存」でそのまま A4 になる。
ナビ・フッター・CTA は消え、出典 URL が紙に残る。コマンドで出すなら:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf=hojokin.pdf --virtual-time-budget=8000 http://localhost:3789/pro/hojokin
```

## 次にやること

1. 文面と ○△× を目で確認 → main にマージ → デプロイ
2. 下書き3行（県 販路開拓系・美波町・海陽町）の一次資料を探して埋める
3. **巡回側**を作る（`sal-ops-os` と同じ依存ゼロ Node が合う）
   - fetch: `sourceUrl` / `rawDocUrl` を取得、HTML→テキスト、PDF→テキスト
   - diff: 前回スナップショットとハッシュ比較。変わった行だけ `changed: true`
   - notify: 変更があった行をメールで自分宛に（sal-ops-os の `smtp.js` を流用）
   - extract（Claude API で要項→JSON）は精度を見てから。公募要領 PDF は `pypdf` でテキスト化できることは確認済み
   - 動かす場所は GitHub Actions cron 週1（月曜朝）。持続化の公募期（11月）と町の創業補助金（5〜7月）は週2
4. Notion DB を `Hojokin` 型と同じ列で作り、将来はそこから `data/hojokin.ts` を生成
5. 11月の持続化補助金 受付開始前に一覧を最新化（`lastChecked` を更新）
