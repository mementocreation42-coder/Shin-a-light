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
