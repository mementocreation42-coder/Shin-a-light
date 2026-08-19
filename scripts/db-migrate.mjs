#!/usr/bin/env node
// db/migrations/*.sql を番号順に適用する。
// 適用済みのファイルは schema_migrations に記録し、二度目以降は飛ばす。
//
//   node scripts/db-migrate.mjs
//
// DATABASE_URL は .env.local から自動で読む。
//   postgresql://…  Neon
//   pglite://<dir>  手元の PGlite（アカウント不要）

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** .env.local を読んで process.env に流し込む（既存の環境変数は上書きしない） */
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
    // 値を囲む引用符は外す
    process.env[key] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
  }
}

/**
 * SQL ファイルを個々の文に割る。
 * Neon の HTTP ドライバは1リクエスト1文しか受け付けないため。
 *
 * 素朴にセミコロンで割っているので、マイグレーションに
 * ドル引用符($$...$$)の関数定義は書かないこと。書くならドライバを Pool に替える。
 */
function splitStatements(sql) {
  return sql
    .split('\n')
    .map((line) => line.replace(/--.*$/, ''))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * 接続先に応じたクライアントを返す。どちらも
 *   sql`...${v}...`  タグ付きテンプレート → 行の配列
 *   sql.query(text)  素の文字列 → 行の配列
 * の2通りで呼べるようにそろえる。
 */
async function connect(url) {
  if (url.startsWith('pglite://')) {
    const { PGlite } = await import('@electric-sql/pglite');
    const { mkdirSync } = await import('node:fs');
    const dir = url.slice('pglite://'.length) || '.data/pglite';
    mkdirSync(dir, { recursive: true });
    const db = new PGlite(dir);
    const sql = async (strings, ...values) => {
      const text = strings.reduce((acc, s, i) => acc + s + (i < values.length ? `$${i + 1}` : ''), '');
      return (await db.query(text, values)).rows;
    };
    sql.query = async (text) => (await db.query(text)).rows;
    sql.close = () => db.close();
    return sql;
  }

  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(url);
  sql.close = async () => {};
  return sql;
}

async function main() {
  loadEnvLocal();

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL が設定されていません。.env.local に追加してください。');
    console.error('手元だけで試すなら:  DATABASE_URL=pglite://.data/pglite');
    process.exit(1);
  }

  const sql = await connect(url);
  console.log(`接続先: ${url.startsWith('pglite://') ? `PGlite (${url})` : 'Neon'}`);

  await sql`
    create table if not exists schema_migrations (
      filename   text primary key,
      applied_at timestamptz not null default now()
    )
  `;

  const applied = new Set(
    (await sql`select filename from schema_migrations`).map((r) => r.filename)
  );

  const dir = join(root, 'db', 'migrations');
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip   ${file}`);
      continue;
    }

    const statements = splitStatements(readFileSync(join(dir, file), 'utf8'));
    for (const statement of statements) {
      await sql.query(statement);
    }

    await sql`insert into schema_migrations (filename) values (${file})`;
    console.log(`applied ${file} (${statements.length} statements)`);
    count++;
  }

  console.log(count === 0 ? '\n適用するものはありませんでした。' : `\n${count}件 適用しました。`);
  await sql.close();
}

main().catch((err) => {
  console.error('\nマイグレーションに失敗しました:', err.message);
  process.exit(1);
});
