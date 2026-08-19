#!/usr/bin/env node
// スプレッドシートから書き出した購読者を DB に取り込む。
//
//   node scripts/import-subscribers.mjs subscribers.csv
//   node scripts/import-subscribers.mjs subscribers.csv --dry-run
//
// 入力は次のどちらでもよい。
//   - CSV（1行目がヘッダ。email を含む列を自動で探す）
//   - 1行1アドレスのテキスト
//
// 既存の購読者は上書きしない。何度実行しても増えない。

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvLocal() {
  const path = join(root, '.env.local');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (process.env[key] !== undefined) continue;
    process.env[key] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function token() {
  return randomBytes(16).toString('base64url');
}

/** 引用符付きフィールドに対応した最小限の CSV 行パーサ */
function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      out.push(cur); cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

/** ファイルの中身からメールアドレスの一覧を取り出す */
function extractEmails(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];

  // 1行1アドレス形式か
  if (!lines[0].includes(',') && EMAIL_RE.test(lines[0].trim())) {
    return lines.map((l) => l.trim()).filter((l) => EMAIL_RE.test(l));
  }

  const header = parseCsvLine(lines[0]);
  let emailCol = header.findIndex((h) => /mail|メール|アドレス/i.test(h));

  // ヘッダから見つからなければ、2行目で実際にアドレスが入っている列を採用する
  if (emailCol === -1 && lines[1]) {
    emailCol = parseCsvLine(lines[1]).findIndex((v) => EMAIL_RE.test(v));
  }
  if (emailCol === -1) {
    throw new Error('メールアドレスの列を特定できませんでした。');
  }

  console.log(`メール列: "${header[emailCol] ?? `(${emailCol}列目)`}"`);

  return lines
    .slice(1)
    .map((l) => parseCsvLine(l)[emailCol])
    .filter((v) => v && EMAIL_RE.test(v));
}

async function main() {
  loadEnvLocal();

  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const file = args.find((a) => !a.startsWith('--'));

  if (!file) {
    console.error('使い方: node scripts/import-subscribers.mjs <file.csv> [--dry-run]');
    process.exit(1);
  }
  if (!existsSync(file)) {
    console.error(`ファイルが見つかりません: ${file}`);
    process.exit(1);
  }

  const raw = extractEmails(readFileSync(file, 'utf8'));

  // 正規化してから重複を落とす。Foo@x.com と foo@x.com は同一人物。
  const emails = [...new Set(raw.map((e) => e.trim().toLowerCase()))];

  console.log(`読み込み: ${raw.length}件 → 重複除去後 ${emails.length}件`);

  if (dryRun) {
    console.log('\n--dry-run のため書き込みません。先頭5件:');
    for (const e of emails.slice(0, 5)) console.log(`  ${e}`);
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL が設定されていません。');
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);

  let inserted = 0;
  for (const email of emails) {
    // 既存分は active のまま触らない。再同意を求めると大半が失われるため。
    const res = await sql`
      insert into subscribers (email, status, unsub_token, source, consented_at)
      values (${email}, 'active', ${token()}, 'import', now())
      on conflict (email) do nothing
      returning id
    `;
    if (res.length > 0) inserted++;
  }

  console.log(`\n新規登録 ${inserted}件 / 既存のためスキップ ${emails.length - inserted}件`);

  const counts = await sql`select status, count(*)::int as count from subscribers group by status`;
  console.log('\n現在の名簿:');
  for (const row of counts) console.log(`  ${row.status.padEnd(14)} ${row.count}`);
}

main().catch((err) => {
  console.error('\n取り込みに失敗しました:', err.message);
  process.exit(1);
});
