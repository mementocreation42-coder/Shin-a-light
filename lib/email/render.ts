/**
 * 原稿(Markdown) → メール用 HTML。
 *
 * メールでは <style> や class が使えないクライアントがあるため、
 * すべてタグに直接 style を書く（インライン化）。
 */

export const palette = {
  // 本文は明るい背景にする。Gmail のダークモードは背景色を勝手に反転させることがあり、
  // 暗い背景を前提に組むと「暗い背景に暗い文字」が起きる。
  pageBg: '#f4f4f4',
  cardBg: '#ffffff',
  text: '#1e1e1e',
  textMuted: '#666666',
  border: '#e2e2e2',
  accent: '#ff764d',
};

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Noto Sans JP', 'Yu Gothic', Meiryo, sans-serif";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * リンク先として許可する URL か。
 * javascript: や data: を弾かないと、原稿経由でスクリプトを仕込まれうる。
 */
function safeUrl(url: string): string | null {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) return trimmed;
  return null;
}

/** 行内の記法。escapeHtml を通したあとの文字列に適用する */
function inline(text: string): string {
  return text
    // 画像 ![alt](url) はリンクより先に処理する
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) => {
      const safe = safeUrl(url);
      if (!safe) return '';
      return `<img src="${safe}" alt="${alt}" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0;border-radius:8px;margin:8px 0;" />`;
    })
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
      const safe = safeUrl(url);
      if (!safe) return label;
      return `<a href="${safe}" style="color:${palette.accent};text-decoration:underline;">${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, `<code style="background:#f0f0f0;padding:2px 5px;border-radius:3px;font-size:14px;">$1</code>`);
}

/**
 * 既存CMSのショートコードを Markdown に寄せる。
 * 管理画面のエディタで [h2]...[/h2] に慣れているので、どちらの記法でも書けるようにする。
 */
function normalizeShortcodes(md: string): string {
  return md
    .replace(/\r\n/g, '\n')
    .replace(/\[h2\]([\s\S]*?)\[\/h2\]/g, (m, t) => `\n\n## ${t.trim()}\n\n`)
    .replace(/\[h3\]([\s\S]*?)\[\/h3\]/g, (m, t) => `\n\n### ${t.trim()}\n\n`)
    .replace(/\[quote\]([\s\S]*?)\[\/quote\]/g, (m, t) => `\n\n> ${t.trim()}\n\n`)
    .replace(/\[ul\]([\s\S]*?)\[\/ul\]/g, (m, t) =>
      '\n\n' +
      t.trim().split('\n')
        .map((l: string) => l.trim())
        .filter(Boolean)
        .map((l: string) => (l.startsWith('-') ? l : `- ${l}`))
        .join('\n') +
      '\n\n'
    );
}

const P_STYLE = `margin:0 0 18px;font-size:16px;line-height:1.85;color:${palette.text};`;

/** 原稿本文を HTML に変換する（段落・見出し・箇条書き・引用・区切り線・画像） */
export function renderMarkdown(md: string): string {
  const out: string[] = [];
  const blocks = normalizeShortcodes(md).split(/\n\s*\n/);

  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;

    const lines = block.split('\n').map((l) => l.trim());

    if (/^##\s+/.test(block)) {
      out.push(
        `<h2 style="margin:32px 0 14px;font-size:21px;line-height:1.45;font-weight:700;color:${palette.text};border-left:4px solid ${palette.accent};padding-left:12px;">${inline(escapeHtml(block.replace(/^##\s+/, '')))}</h2>`
      );
      continue;
    }
    if (/^###\s+/.test(block)) {
      out.push(
        `<h3 style="margin:26px 0 12px;font-size:17px;line-height:1.5;font-weight:700;color:${palette.text};">${inline(escapeHtml(block.replace(/^###\s+/, '')))}</h3>`
      );
      continue;
    }
    if (/^(---|\*\*\*)$/.test(block)) {
      out.push(`<hr style="border:0;border-top:1px solid ${palette.border};margin:32px 0;" />`);
      continue;
    }
    if (lines.every((l) => /^[-*]\s+/.test(l))) {
      const items = lines
        .map((l) => `<li style="margin:0 0 8px;">${inline(escapeHtml(l.replace(/^[-*]\s+/, '')))}</li>`)
        .join('');
      out.push(
        `<ul style="margin:0 0 18px;padding-left:22px;font-size:16px;line-height:1.85;color:${palette.text};">${items}</ul>`
      );
      continue;
    }
    if (lines.every((l) => /^\d+\.\s+/.test(l))) {
      const items = lines
        .map((l) => `<li style="margin:0 0 8px;">${inline(escapeHtml(l.replace(/^\d+\.\s+/, '')))}</li>`)
        .join('');
      out.push(
        `<ol style="margin:0 0 18px;padding-left:22px;font-size:16px;line-height:1.85;color:${palette.text};">${items}</ol>`
      );
      continue;
    }
    if (lines.every((l) => l.startsWith('>'))) {
      const body = inline(escapeHtml(lines.map((l) => l.replace(/^>\s?/, '')).join(' ')));
      out.push(
        `<blockquote style="margin:0 0 18px;padding:14px 18px;background:#faf7f5;border-left:3px solid ${palette.accent};font-size:15px;line-height:1.8;color:${palette.textMuted};">${body}</blockquote>`
      );
      continue;
    }

    // 画像だけの段落は <p> で包むと余白が乱れるのでそのまま出す
    const html = inline(escapeHtml(block).replace(/\n/g, '<br />'));
    if (/^<img /.test(html)) {
      out.push(html);
      continue;
    }
    out.push(`<p style="${P_STYLE}">${html}</p>`);
  }

  return out.join('\n');
}

/**
 * プレーンテキスト版。
 * HTML だけのメールは迷惑メール判定を受けやすいので必ず両方送る。
 */
export function toPlainText(md: string): string {
  return normalizeShortcodes(md)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '$1 $2')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1 <$2>')
    .replace(/^###\s+/gm, '')
    .replace(/^##\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export { FONT };
