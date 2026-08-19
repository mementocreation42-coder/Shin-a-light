# Project Handover Guide

このプロジェクトを別のコンピュータに移行・セットアップするための手順です。

## 前提条件

新しいコンピュータに以下がインストールされている必要があります：
- **Node.js**: 最新のLTSバージョン推奨 (v18 or v20+)
- **Git**

## セットアップ手順

### 1. リポジトリのクローン
ターミナル（Mac）またはコマンドプロンプト/PowerShell（Windows）を開き、以下のコマンドを実行してプロジェクトをダウンロードします。

```bash
git clone https://github.com/mementocreation42-coder/Shin-a-light.git
cd Shin-a-light
```

### 2. 依存関係のインストール
プロジェクトフォルダに入ったら、必要なライブラリをインストールします。

```bash
npm install
```

### 3. 環境設定
現在、API URLなどはコード内に直接記述されているため、追加の `.env` ファイル設定は不要です。
- WordPress API URL: `lib/wordpress.ts` 内に記述
- 画像ドメイン設定: `next.config.ts` 内に記述

### 4. 開発サーバーの起動
以下のコマンドでローカルサーバーを立ち上げます。

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスして動作を確認してください。

## 注意事項

- **画像が表示されない場合**: 
  - `next.config.ts` に新しい画像のドメイン（例: YouTubeや外部サイト）が追加されているか確認してください。
- **データが取得できない場合**:
  - `https://journal.shinealight.jp` (WordPress側) が稼働しているか、SSL証明書が有効か確認してください。

## ニュースレター（自作メルマガ）

名簿・原稿・配信記録は Postgres に持ち、メールの送信だけ外部サービスに任せる構成です。

### 環境変数（`.env.local`）

| 変数 | 用途 |
|---|---|
| `DATABASE_URL` | 名簿と原稿の保存先。本番は Neon の `postgresql://…`。手元だけなら `pglite://.data/pglite`（アカウント不要） |
| `SITE_URL` | 確認・解除リンクの起点。`https://www.shinealight.jp` |
| `MAIL_PROVIDER` | `resend` / `brevo` / `outbox`。未設定なら API キーの有無で自動判定、どちらも無ければ `outbox`（`.mail-outbox/` にファイル書き出し） |
| `RESEND_API_KEY` または `BREVO_API_KEY` | 送信サービスの鍵。100人以下なら Resend、それ以上なら Brevo（無料枠の日次上限の違い） |
| `RESEND_WEBHOOK_SECRET` / `BREVO_WEBHOOK_SECRET` | 不達・苦情・開封の通知を受けるときの検証用。未設定だと通知を受け付けない |
| `MAIL_FROM` / `MAIL_FROM_NAME` | 差出人。`newsletter@mail.shinealight.jp` / `Shine a Light` |
| `MAIL_SENDER_ADDRESS` | フッターに出す住所（特定電子メール法） |
| `MAIL_TEST_TO` | 管理画面のテスト送信の既定の宛先 |

### 手順

```bash
npm run db:migrate            # db/migrations/*.sql を順に適用（何度実行しても安全）
npm run newsletter:selftest   # 使い捨ての手元DBで、登録→確認→解除→配信→通知 を通しで検証
node scripts/import-subscribers.mjs subscribers.csv --dry-run   # 旧名簿(CSV)の取り込み
```

### 送信サービス側の設定

- Webhook の宛先: `https://www.shinealight.jp/api/newsletter/webhook`
  （Brevo は `?secret=<BREVO_WEBHOOK_SECRET>` を付ける）
- DNS: 配信専用サブドメイン `mail.shinealight.jp` に SPF / DKIM / DMARC。値は送信サービスの画面に出るものをそのまま登録する。
  メインドメインと分けておくと、評価が落ちても通常のメールを巻き込まない。

### 画面

- 執筆・テスト送信: `/admin/newsletter` → 「新しい号」
- 配信: 号の編集画面 → 「配信へ」。1回で最大 200 通、残りは押し直す（届いた人には二度と送らない）
- 名簿: `/admin/newsletter` の下段。手動登録は確認メールを送らないので、同意済みの相手だけ入れる
