/**
 * Markdown → WordPress（Gutenberg ブロック HTML）。
 * 管理画面の投稿エディタが作るものと同じ形にそろえ、WP 側で普通に編集できるようにする。
 * ポッドキャスト記事（lib/podcastArticle.ts）とインタビュー下書き（lib/interviewDraft.ts）で共用。
 */

export function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** 太字とリンクだけの、最小限のインライン記法 */
export function inlineMd(s: string): string {
  return escHtml(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');
}

/** 段落ブロック。className はサイト側が意味を読むための印（例: iv-byline） */
export function paragraphBlock(text: string, className?: string): string {
  const attrs = className ? ` {"className":"${className}"}` : '';
  const cls = className ? ` class="${className}"` : '';
  return `<!-- wp:paragraph${attrs} -->\n<p${cls}>${inlineMd(text)}</p>\n<!-- /wp:paragraph -->`;
}

/**
 * 記事本文の Markdown を Gutenberg のブロック HTML にする。
 * 対応: ## / ### 見出し、- 箇条書き、> 引用、![説明](URL) だけの行＝画像、段落（段落内の改行は <br>）
 */
export function markdownToGutenberg(md: string): string {
  const out: string[] = [];
  for (const raw of md.replace(/\r\n/g, '\n').split(/\n\s*\n/)) {
    const block = raw.trim();
    if (!block) continue;
    const lines = block.split('\n').map((l) => l.trim());

    const img = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (img) {
      const [, alt, src] = img;
      const caption = alt ? `<figcaption class="wp-element-caption">${escHtml(alt)}</figcaption>` : '';
      out.push(`<!-- wp:image {"sizeSlug":"large"} -->\n<figure class="wp-block-image size-large"><img src="${escHtml(src)}" alt="${escHtml(alt)}"/>${caption}</figure>\n<!-- /wp:image -->`);
    } else if (/^##\s+/.test(block)) {
      out.push(`<!-- wp:heading {"level":2} -->\n<h2 class="wp-block-heading">${inlineMd(block.replace(/^##\s+/, ''))}</h2>\n<!-- /wp:heading -->`);
    } else if (/^###\s+/.test(block)) {
      out.push(`<!-- wp:heading {"level":3} -->\n<h3 class="wp-block-heading">${inlineMd(block.replace(/^###\s+/, ''))}</h3>\n<!-- /wp:heading -->`);
    } else if (lines.every((l) => /^[-*]\s+/.test(l))) {
      const items = lines.map((l) => `<li>${inlineMd(l.replace(/^[-*]\s+/, ''))}</li>`).join('');
      out.push(`<!-- wp:list -->\n<ul class="wp-block-list">${items}</ul>\n<!-- /wp:list -->`);
    } else if (lines.every((l) => l.startsWith('>'))) {
      const body = inlineMd(lines.map((l) => l.replace(/^>\s?/, '')).join(' '));
      out.push(`<!-- wp:quote -->\n<blockquote class="wp-block-quote"><p>${body}</p></blockquote>\n<!-- /wp:quote -->`);
    } else {
      out.push(`<!-- wp:paragraph -->\n<p>${inlineMd(block).replace(/\n/g, '<br>')}</p>\n<!-- /wp:paragraph -->`);
    }
  }
  return out.join('\n\n');
}

/** ブロックコメントを外して、WP が返す content.rendered に近い HTML にする（手元プレビュー用） */
export function stripBlockComments(html: string): string {
  return html.replace(/<!--\s*\/?wp:[\s\S]*?-->\s*/g, '').trim();
}
