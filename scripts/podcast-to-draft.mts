// ポッドキャストのエピソードを、journal の「下書き」記事にする。
//
//   npx tsx scripts/podcast-to-draft.mts                 # 最新エピソード
//   npx tsx scripts/podcast-to-draft.mts --episode 43    # 番号指定（タイトル冒頭の "Episode 43" を見る）
//   npx tsx scripts/podcast-to-draft.mts --dry-run       # WP に作らず、原稿を表示するだけ
//   npx tsx scripts/podcast-to-draft.mts --article path.md   # 記事化を飛ばし、用意した原稿で下書きを作る
//   npx tsx scripts/podcast-to-draft.mts --list              # 直近のエピソードと処理状況を表示
//   npx tsx scripts/podcast-to-draft.mts --transcribe-only   # 文字起こしまでで止める（記事は人/Claude Codeが書く）
//
// 流れ:  RSS → 音声DL → 文字起こし(mlx-whisper, 手元) → 記事化(Claude) → WP下書き
// 文字起こしと記事は .data/podcast/ に残すので、やり直しても二度目は速い。
//
// 必要なもの:
//   文字起こし … python3 -m pip install mlx-whisper（Apple Silicon）
//   記事化     … ANTHROPIC_API_KEY（.env.local か環境変数）
//   下書き作成 … WORDPRESS_APP_USERNAME / WORDPRESS_APP_PASSWORD（既存）

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// .env.local を読む（既存の環境変数は上書きしない）
for (const line of existsSync('.env.local') ? readFileSync('.env.local', 'utf8').split('\n') : []) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq === -1) continue;
  const k = t.slice(0, eq).trim();
  if (process.env[k] === undefined) process.env[k] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
}

const { getPodcast, resolveSpotifyEpisodeUrl } = await import('../lib/podcast');
const { createWPPost } = await import('../lib/wordpress');
const { draftArticle, parseDraft, markdownToGutenberg, episodeLeadBlock, episodeFooterBlock } = await import('../lib/podcastArticle');

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const dryRun = args.includes('--dry-run');
const transcribeOnly = args.includes('--transcribe-only');
const listOnly = args.includes('--list');
const episodeNo = flag('--episode');
const articlePath = flag('--article');

const DIR = join(process.cwd(), '.data', 'podcast');
mkdirSync(DIR, { recursive: true });

const slugOf = (title: string, guid: string) =>
  (title.match(/Episode\s*(\d+)/i)?.[1] ?? guid).padStart(3, '0');

// ===== 1. エピソードを選ぶ =====
const show = await getPodcast();
if (!show) throw new Error('RSS を取得できませんでした');

if (listOnly) {
  // 処理済みの印は「下書きを作ったときに残す .done」。記事ファイルだけでは未作成かもしれない
  for (const e of show.episodes.slice(0, 10)) {
    const s = slugOf(e.title, e.guid);
    const done = join(DIR, `ep${s}.done`);
    const state = existsSync(done)
      ? readFileSync(done, 'utf8').startsWith('skipped') ? '対象外（手動で除外）' : '下書き済み'
      : existsSync(join(DIR, `ep${s}.transcript.json`))
        ? '文字起こし済み（記事未作成）'
        : '未処理';
    console.log(`${s}  ${state.padEnd(16)}  ${e.title}  (${e.duration}, ${e.pubDate})`);
  }
  process.exit(0);
}

const episode = episodeNo
  ? show.episodes.find((e) => new RegExp(`^Episode\\s*0*${episodeNo}\\b`, 'i').test(e.title))
  : show.episodes[0];
if (!episode) throw new Error(`エピソードが見つかりません: ${episodeNo}`);

const slug = slugOf(episode.title, episode.guid);
console.log(`対象: ${episode.title}（${episode.duration}）`);

// 埋め込みプレイヤー用に open.spotify.com の URL へ差し替える（取れなければ RSS の link のまま）
const spotifyUrl = await resolveSpotifyEpisodeUrl(episode.title);
if (spotifyUrl) {
  episode.link = spotifyUrl;
  console.log(`Spotify URL: ${spotifyUrl}`);
} else {
  console.log('open.spotify.com の URL を解決できず、RSS の link を使います（プレイヤーは出ません）');
}
if (existsSync(join(DIR, `ep${slug}.done`)) && !args.includes('--force')) {
  console.log('この回はすでに下書きを作成済みです（やり直すなら --force）。');
  process.exit(0);
}

// ===== 2. 原稿を用意する =====
let article: { title: string; excerpt: string; bodyMd: string };

if (articlePath) {
  article = parseDraft(readFileSync(articlePath, 'utf8'));
  console.log(`原稿: ${articlePath} を使用`);
} else {
  // 2a. 音声
  const audioPath = join(DIR, `ep${slug}.mp3`);
  if (!existsSync(audioPath)) {
    console.log('音声をダウンロード中…');
    const res = await fetch(episode.audioUrl);
    if (!res.ok) throw new Error(`音声の取得に失敗: ${res.status}`);
    writeFileSync(audioPath, Buffer.from(await res.arrayBuffer()));
  }

  // 2b. 文字起こし
  const transcriptPath = join(DIR, `ep${slug}.transcript.json`);
  if (!existsSync(transcriptPath)) {
    console.log('文字起こし中（初回はモデルのダウンロードで時間がかかります）…');
    const out = execFileSync('python3', ['scripts/transcribe.py', audioPath], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'inherit'],
    });
    writeFileSync(transcriptPath, out);
  }
  const transcript: string = JSON.parse(readFileSync(transcriptPath, 'utf8')).text;
  console.log(`文字起こし: ${transcript.length.toLocaleString()}字`);

  if (transcribeOnly) {
    // 記事は別の手（Claude Code など）が書く。書き終えたら --article で渡す。
    const txt = join(DIR, `ep${slug}.transcript.txt`);
    writeFileSync(txt, transcript);
    console.log(`\n文字起こしを保存: ${txt}`);
    console.log(`次: 原稿を ${join(DIR, `ep${slug}.article.md`)} に書き、`);
    console.log(`    npx tsx scripts/podcast-to-draft.mts --episode ${Number(slug)} --article ${join(DIR, `ep${slug}.article.md`)}`);
    process.exit(0);
  }

  // 2c. 記事化
  const articleFile = join(DIR, `ep${slug}.article.md`);
  if (existsSync(articleFile)) {
    article = parseDraft(readFileSync(articleFile, 'utf8'));
    console.log(`原稿: ${articleFile}（前回の結果）を使用`);
  } else {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY が無いため記事化できません。--article で原稿を渡すこともできます。');
    }
    console.log('記事化中…');
    const voiceNotesPath = join(process.cwd(), 'docs', 'podcast-voice-notes.md');
    const voiceNotes = existsSync(voiceNotesPath) ? readFileSync(voiceNotesPath, 'utf8') : undefined;
    article = await draftArticle(
      { title: episode.title, link: episode.link, pubDate: episode.pubDate, duration: episode.duration, summary: episode.summary },
      transcript,
      { voiceNotes }
    );
    writeFileSync(articleFile, `TITLE: ${article.title}\nEXCERPT: ${article.excerpt}\n---\n${article.bodyMd}\n`);
    console.log(`原稿を保存: ${articleFile}`);
  }
}

if (!article.title) throw new Error('原稿のタイトルが空です');

// ===== 3. WordPress に下書きを作る =====
const content = `${episodeLeadBlock(episode)}\n\n${markdownToGutenberg(article.bodyMd)}\n\n${episodeFooterBlock(episode)}`;

console.log('\n--- タイトル ---\n' + article.title);
console.log('\n--- 抜粋 ---\n' + article.excerpt);
console.log(`\n--- 本文 --- ${article.bodyMd.length.toLocaleString()}字 / 見出し ${(article.bodyMd.match(/^##\s/gm) ?? []).length}個`);

if (dryRun) {
  console.log('\n' + article.bodyMd);
  console.log('\n--dry-run のため WordPress には作成していません。');
} else {
  // journal(10)。カテゴリの追加は WP 側で
  // 下書きにはタイトル文字の仮アイキャッチを付けておく（失敗しても投稿は作る）
  const { createTitleEyecatchMedia } = await import('../lib/eyecatch/draftEyecatch');
  const featured_media = (await createTitleEyecatchMedia(article.title)) || undefined;
  const post = await createWPPost({ title: article.title, content, excerpt: article.excerpt, status: 'draft', categories: [10], featured_media });
  const url = `https://journal.shinealight.jp/wp-admin/post.php?post=${post.id}&action=edit`;
  // 処理済みの印。--list と二重作成の防止に使う
  writeFileSync(join(DIR, `ep${slug}.done`), `${new Date().toISOString()} ${url}\n`);
  console.log(`\n下書きを作成しました: ${url}`);
}
