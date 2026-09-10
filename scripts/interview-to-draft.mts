// SAL Echos で書き起こしたインタビュー（library/<フォルダ>/interview.md + meta.json）を、
// journal（WordPress）の「Interview」カテゴリの下書きにする。公開は WP 側で。
// 公開後1時間以内にサイトの /interview に出る。
//
//   npm run interview:draft -- --list                   # library の一覧と処理状況
//   npm run interview:draft -- --latest                 # いちばん新しいフォルダ
//   npm run interview:draft -- 2026-09-05_山田          # フォルダ名（library 直下）か、フルパス
//   npm run interview:draft -- <対象> --dry-run         # WP に作らず、本文ブロックを .data/interviews/ に書き出す
//   npm run interview:draft -- <対象> --force           # 作成済みでも作り直す
//
// 見た目の確認は開発サーバーで: http://localhost:3000/interview/preview?folder=<フォルダ名>
//
// 必要なもの: WORDPRESS_APP_USERNAME / WORDPRESS_APP_PASSWORD（.env.local、既存）
// カテゴリ「Interview」（slug: interview）が無ければ、最初の実行で作る。
// 作業フォルダの場所を変えるときは SAL_ECHOS_ROOT（.env.local か環境変数）。

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

// .env.local を読む（既存の環境変数は上書きしない）
for (const line of existsSync('.env.local') ? readFileSync('.env.local', 'utf8').split('\n') : []) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq === -1) continue;
  const k = t.slice(0, eq).trim();
  if (process.env[k] === undefined) process.env[k] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
}

// SAL_ECHOS_ROOT を .env.local から拾わせるため、env を読んだあとに import する
const { buildInterviewDraft, listLibraryFolders, SAL_ECHOS_LIBRARY } = await import('../lib/interviewDraft');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const listOnly = args.includes('--list');
const latest = args.includes('--latest');
const target = args.find((a) => !a.startsWith('--'));

const OUT_DIR = join(process.cwd(), '.data', 'interviews');
mkdirSync(OUT_DIR, { recursive: true });
const doneFile = (name: string) => join(OUT_DIR, `${name}.done`);

// ===== 1. 対象を選ぶ =====
const folders = listLibraryFolders();

if (listOnly) {
  if (folders.length === 0) console.log(`library に interview.md を持つフォルダがありません: ${SAL_ECHOS_LIBRARY}`);
  for (const f of folders) {
    const done = doneFile(f);
    const state = existsSync(done) ? `下書き済み  ${readFileSync(done, 'utf8').trim().split(' ').pop()}` : '未作成';
    console.log(`${f}  ${state}`);
  }
  process.exit(0);
}

let dir: string;
if (latest) {
  if (folders.length === 0) throw new Error(`library に interview.md を持つフォルダがありません: ${SAL_ECHOS_LIBRARY}`);
  dir = join(SAL_ECHOS_LIBRARY, folders[0]);
} else if (target) {
  dir = existsSync(join(SAL_ECHOS_LIBRARY, target, 'interview.md')) ? join(SAL_ECHOS_LIBRARY, target) : resolve(target);
} else {
  console.log('対象を指定してください: フォルダ名 / フルパス / --latest（一覧は --list）');
  process.exit(1);
}
if (!existsSync(join(dir, 'interview.md'))) throw new Error(`interview.md がありません: ${dir}`);

const name = basename(dir);
if (existsSync(doneFile(name)) && !force && !dryRun) {
  console.log(`このインタビューは下書きを作成済みです（やり直すなら --force）: ${readFileSync(doneFile(name), 'utf8').trim()}`);
  process.exit(0);
}

// ===== 2. 原稿を組む =====
const draft = buildInterviewDraft(dir);
if (!draft.title) throw new Error('タイトルが空です（interview.md の「# タイトル」か meta.json の title）');

console.log(`対象: ${dir}`);
console.log(`\n--- タイトル ---\n${draft.title}`);
console.log(`\n--- 肩書き行 ---\n${draft.byline ?? '（なし。meta.json の interviewee か、タイトル直下に「肩書き - 氏名」の行を）'}`);
console.log(`\n--- 収録日 ---\n${draft.recordedOn ?? '（なし）'}`);
console.log(`\n--- 抜粋 ---\n${draft.excerpt || '（なし）'}`);
console.log(`\n--- 本文 --- ${draft.stats.chars.toLocaleString()}字 / 見出し ${draft.stats.headings}個 / 発言 ${draft.stats.lines}行`);
if (draft.pending) {
  console.log(`\n--- 要確認（下書きには入れません。公開前に直すこと）---\n${draft.pending}`);
}

if (dryRun) {
  const out = join(OUT_DIR, `${name}.html`);
  writeFileSync(out, draft.content);
  console.log(`\n--dry-run のため WordPress には作成していません。本文ブロックを書き出しました: ${out}`);
  console.log(`見た目の確認: http://localhost:3000/interview/preview?folder=${encodeURIComponent(name)}`);
  process.exit(0);
}

// ===== 3. WordPress に下書きを作る =====
const { createWPPost, getOrCreateInterviewCategoryId } = await import('../lib/wordpress');
const { createTitleEyecatchMedia } = await import('../lib/eyecatch/draftEyecatch');

const categoryId = await getOrCreateInterviewCategoryId();
// 仮アイキャッチ（タイトル文字）。失敗しても投稿は作る。写真は WP 側で差し替える
const featured_media = (await createTitleEyecatchMedia(draft.title)) || undefined;
const post = await createWPPost({
  title: draft.title,
  content: draft.content,
  excerpt: draft.excerpt,
  status: 'draft',
  categories: [categoryId],
  featured_media,
});
const url = `https://journal.shinealight.jp/wp-admin/post.php?post=${post.id}&action=edit`;
writeFileSync(doneFile(name), `${new Date().toISOString()} ${url}\n`);
console.log(`\n下書きを作成しました: ${url}`);
console.log('写真の差し替えと公開は WP（またはサイトの投稿管理）で。公開後1時間以内に /interview に出ます。');
