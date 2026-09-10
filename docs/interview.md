# /interview — インタビュー（対話の記録）の構成（引き継ぎメモ）

最終更新: 2026-09-10

小林が聞き手となって行うインタビューを、サイトのコンテンツとして出すためのセクション。
書き起こし〜記事化は Claude Code の `interview` スキル（SAL Echos、`~/.claude/skills/interview`）が担い、
このリポジトリは「WP 下書きにする」「サイトに出す」の2つを担当する。

## 置き場と URL

| 何 | どこ |
|---|---|
| 記事の置き場 | Journal（WordPress）のカテゴリ **Interview**（slug `interview`）。最初の下書き作成時にスクリプトが作る |
| 一覧 | `/interview`（`app/interview/page.tsx`）。新しい順、12件ずつ |
| 記事 | `/interview/[id]`（`app/interview/[id]/page.tsx`）。id は WP の投稿 id |
| 手元プレビュー | `/interview/preview?folder=<フォルダ名>`（開発サーバーのみ。本番は 404） |
| 読み替え | `lib/interviews.ts`（取得・肩書き行・対話行の変換） |
| 下書き作成 | `scripts/interview-to-draft.mts`（`npm run interview:draft`）、変換は `lib/interviewDraft.ts` |
| CSS | `app/globals.css` 末尾の `.iv-*` |

- ジャーナル一覧（`/journal`）からは Interview カテゴリを除外（ギャラリーと同じ扱い）。`/journal/[id]` にインタビューの id が来たら `/interview/[id]` へ恒久転送
- Nav（A面）に「Interview」を追加。sitemap にも一覧と記事を載せる

## 記事の形（interview.md をそのまま前提にする）

```
# タイトル
肩書き・所属 - 氏名          ← 下書きスクリプトが class="iv-byline" の段落にする
（収録日）                  ← meta.json の recorded_on。class="iv-recorded"

リード文…

## 見出し
小林：質問
相手：答え

## 要確認                  ← 内部メモ。下書きには入れず、万一残っていてもサイトには出さない
```

- サイト側は「小林：」の段落を「――質問」の太字に、それ以外のラベルの段落を答え（普通の段落）にする。名前は出さない（ラベルは全角コロン、または半角コロン＋空白で判定）
- 印が無い投稿（管理画面で手で貼ったもの）でも、冒頭の短い一段落に「 - 」か「｜」があれば肩書き行とみなす
- 抜粋は meta.json の `summary`。無ければ本文の最初の段落

## 流れ

1. `interview` スキルで `library/YYYY-MM-DD_相手名/interview.md` と `meta.json` ができる
2. 見た目を確かめる: `npm run dev` → `http://localhost:3000/interview/preview?folder=YYYY-MM-DD_相手名`
3. 下書きにする: `npm run interview:draft -- YYYY-MM-DD_相手名`（`--dry-run` なら WP に作らず `.data/interviews/` に HTML だけ）
4. WP（またはサイトの投稿管理 `/admin/posts`）で写真（アイキャッチ・本文）を入れ、要確認を直して公開
5. 1時間以内に `/interview` に出る（ISR）。急ぐならデプロイし直す

`.data/interviews/<フォルダ>.done` が「下書き作成済み」の印。`--force` で作り直せる。

## 未決・次にやること

- 写真: library には音声しか無いので、写真は WP 側で手で入れる。取材写真の置き場が決まったら、スクリプトでアップロードまで
- 相手ごとのページ（`knowledge/people/` の情報）を出すかどうか
- `interview` スキルの手順に「サイトに出す」（上の 2〜3）を足す
