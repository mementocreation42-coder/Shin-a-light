import Anthropic from '@anthropic-ai/sdk';

/**
 * ポッドキャストの文字起こしを、journal の記事原稿に書き直す。
 *
 * 出力は「下書き」に落とす前提。文字起こしは固有名詞を取り違えるし、
 * 書き直しは話していないことを補いがちなので、公開前に必ず人が読む。
 */

export interface EpisodeInfo {
  title: string;
  /** Spotify などのエピソードページ */
  link: string;
  pubDate: string;
  duration: string;
  /** RSS に載っている概要。話者自身が書いた要約なので手がかりになる */
  summary: string;
}

export interface ArticleDraft {
  /** 記事タイトル（エピソード名をそのまま使わず、記事として立つもの） */
  title: string;
  /** 抜粋。一覧や OGP に出る 80〜120 字 */
  excerpt: string;
  /** 本文。## 見出し / 段落 / - 箇条書き / > 引用 の Markdown */
  bodyMd: string;
}

const SYSTEM = `あなたは、話し手本人の文章として読める記事を書く編集者です。
ポッドキャストの文字起こしを受け取り、同じ人が書いた journal の記事に「昇華」させます。
書き起こしの整文ではなく、話を素材にしたコラムを書いてください。

## 昇華のしかた
- 時系列（喋った順）を捨て、テーマで再構成する。話の中で一番面白い視点・気づきを見つけ、それを軸に組み立てる。
- 収録状況の説明（車内で録っている、雑音が入る、今日は何を話そう、それでは終わります等）は全て捨てる。ラジオの枠組みはリンク案内が担うので、本文には持ち込まない。
- 冒頭は記事の核となる事実か視点から入る。挨拶・前置き禁止。
- 脱線した話題は、軸に繋がるなら位置を変えて活かし、繋がらないなら削る。
- 結びは要約や美談ではなく、話の中にあった気づき・これからやりたいことで着地させる。

## 事実の扱い（最重要）
- 事実・数字・固有名詞・エピソードは、文字起こしにあるものだけを使う。一般論・調べた知識・話していない感想を足さない。
- 「昇華」してよいのは構成と表現であって、内容ではない。
- 文字起こしの誤りが明らかな固有名詞は、文脈から妥当なら直し、確信がなければそのまま残す。

## 文体
- 一人称は「僕」。くだけた敬体（〜です／〜ます）に「〜だった」「〜と思う」を混ぜる。（笑）をたまに。
- 「えー」「なんか」の類、言い直し、相槌は落とす。
- 見出し（##）は3〜5個。短く、内容が立つもの。
- 長さは文字起こしの5〜7割。

出力は次の形だけ。前置きも説明も書かない。

TITLE: 記事タイトル
EXCERPT: 抜粋（80〜120字、1文か2文）
---
本文（Markdown）`;

export async function draftArticle(
  episode: EpisodeInfo,
  transcript: string,
  opts: { styleSamples?: string[]; voiceNotes?: string; model?: string } = {}
): Promise<ArticleDraft> {
  const client = new Anthropic();

  const samples = (opts.styleSamples ?? [])
    .map((s, i) => `<sample index="${i + 1}">\n${s.trim()}\n</sample>`)
    .join('\n\n');

  const user = [
    samples
      ? `この人が過去に書いた記事の文体見本です。語り口・段落の長さ・言い回しをここに寄せてください。内容は参照しないこと。\n\n${samples}\n`
      : '',
    opts.voiceNotes
      ? `過去の下書きが公開前にどう直されたかを見て溜めた、文体の注意点です。書くときに反映してください。\n\n<voice_notes>\n${opts.voiceNotes.trim()}\n</voice_notes>\n`
      : '',
    `エピソード情報
- タイトル: ${episode.title}
- 公開日: ${episode.pubDate}
- 長さ: ${episode.duration}
- 本人が書いた概要: ${episode.summary || '（なし）'}

文字起こし
<transcript>
${transcript.trim()}
</transcript>`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const stream = client.messages.stream({
    model: opts.model ?? 'claude-opus-5',
    max_tokens: 16000,
    system: SYSTEM,
    messages: [{ role: 'user', content: user }],
  });
  const message = await stream.finalMessage();

  if (message.stop_reason === 'refusal') {
    throw new Error(`記事化を拒否されました: ${message.stop_details?.explanation ?? ''}`);
  }

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

  return parseDraft(text);
}

/** モデルの出力（TITLE/EXCERPT/---/本文）を分解する */
export function parseDraft(text: string): ArticleDraft {
  const m = /^\s*TITLE:\s*(.+?)\s*\nEXCERPT:\s*([\s\S]+?)\s*\n---\s*\n([\s\S]+)$/.exec(text);
  if (!m) {
    // 形が崩れていても本文は捨てない
    return { title: '', excerpt: '', bodyMd: text.trim() };
  }
  return { title: m[1].trim(), excerpt: m[2].replace(/\s+/g, ' ').trim(), bodyMd: m[3].trim() };
}

// ===== Markdown → WordPress（Gutenberg ブロック）=====

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s: string): string {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');
}

/**
 * 記事本文の Markdown を Gutenberg のブロック HTML にする。
 * 管理画面の投稿エディタが作るものと同じ形にそろえ、WP 側で普通に編集できるようにする。
 */
export function markdownToGutenberg(md: string): string {
  const out: string[] = [];
  for (const raw of md.replace(/\r\n/g, '\n').split(/\n\s*\n/)) {
    const block = raw.trim();
    if (!block) continue;
    const lines = block.split('\n').map((l) => l.trim());

    if (/^##\s+/.test(block)) {
      out.push(`<!-- wp:heading {"level":2} -->\n<h2 class="wp-block-heading">${inline(block.replace(/^##\s+/, ''))}</h2>\n<!-- /wp:heading -->`);
    } else if (/^###\s+/.test(block)) {
      out.push(`<!-- wp:heading {"level":3} -->\n<h3 class="wp-block-heading">${inline(block.replace(/^###\s+/, ''))}</h3>\n<!-- /wp:heading -->`);
    } else if (lines.every((l) => /^[-*]\s+/.test(l))) {
      const items = lines.map((l) => `<li>${inline(l.replace(/^[-*]\s+/, ''))}</li>`).join('');
      out.push(`<!-- wp:list -->\n<ul class="wp-block-list">${items}</ul>\n<!-- /wp:list -->`);
    } else if (lines.every((l) => l.startsWith('>'))) {
      const body = inline(lines.map((l) => l.replace(/^>\s?/, '')).join(' '));
      out.push(`<!-- wp:quote -->\n<blockquote class="wp-block-quote"><p>${body}</p></blockquote>\n<!-- /wp:quote -->`);
    } else {
      out.push(`<!-- wp:paragraph -->\n<p>${inline(block).replace(/\n/g, '<br>')}</p>\n<!-- /wp:paragraph -->`);
    }
  }
  return out.join('\n\n');
}

/** サイトのポッドキャスト一覧ページ。冒頭・末尾のリンクカードの飛び先 */
const PODCAST_PAGE_URL = 'https://www.shinealight.jp/podcast';

/**
 * ポッドキャスト一覧ページへのリンクカード。
 * サイト側(lib/ogp.ts の processLinkCards)が「URLだけの段落」を
 * OGP付きカードに展開するので、その形で置く。
 */
function podcastPageCard(): string {
  return `<!-- wp:paragraph -->\n<p>${PODCAST_PAGE_URL}</p>\n<!-- /wp:paragraph -->`;
}

/** 記事の先頭に置く、元エピソードへの案内（説明文 → プレイヤー → 一覧へのカード） */
export function episodeLeadBlock(episode: EpisodeInfo): string {
  const lead = `<!-- wp:paragraph {"className":"podcast-lead"} -->\n<p class="podcast-lead">この記事はポッドキャスト <a href="${esc(episode.link)}">${esc(episode.title)}</a>（${esc(episode.duration)}）の内容を書き起こし、読みものとしてまとめ直したものです。</p>\n<!-- /wp:paragraph -->`;
  return `${lead}\n\n${episodeEmbedBlock(episode)}\n\n${podcastPageCard()}`;
}

/** Spotify の埋め込みプレイヤー。WP の oEmbed が URL からプレイヤーに展開する */
export function episodeEmbedBlock(episode: EpisodeInfo): string {
  const url = esc(episode.link);
  return `<!-- wp:embed {"url":"${url}","type":"rich","providerNameSlug":"spotify","responsive":true} -->\n<figure class="wp-block-embed is-type-rich is-provider-spotify wp-block-embed-spotify"><div class="wp-block-embed__wrapper">\n${url}\n</div></figure>\n<!-- /wp:embed -->`;
}

/**
 * 記事の末尾に置く、エピソードへの誘導。
 * 最後の「URLだけの段落」は、サイト側(lib/ogp.ts の processLinkCards)が
 * OGP付きのリンクカードに展開する。
 */
export function episodeFooterBlock(episode: EpisodeInfo): string {
  return `<!-- wp:separator -->\n<hr class="wp-block-separator has-alpha-channel-opacity"/>\n<!-- /wp:separator -->\n\n<!-- wp:paragraph {"className":"podcast-footer"} -->\n<p class="podcast-footer">🎧 この話は音声でも聴けます: <a href="${esc(episode.link)}">${esc(episode.title)}</a>（${esc(episode.duration)}）</p>\n<!-- /wp:paragraph -->\n\n${podcastPageCard()}`;
}
