interface OGPData {
  title: string;
  description: string;
  image: string | null;
  siteName: string;
  url: string;
  favicon: string;
}

function getMetaContent(html: string, property: string): string {
  const patterns = [
    new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return '';
}

export async function fetchOGP(url: string): Promise<OGPData | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) return null;

    const html = await res.text();

    const title =
      getMetaContent(html, 'og:title') ||
      html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ||
      '';

    const description =
      getMetaContent(html, 'og:description') ||
      getMetaContent(html, 'description');

    const image = getMetaContent(html, 'og:image') || null;

    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    return {
      title: title.trim(),
      description: description.trim(),
      image,
      siteName: getMetaContent(html, 'og:site_name') || domain,
      url,
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
    };
  } catch {
    return null;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderLinkCard(ogp: OGPData): string {
  const imageHtml = ogp.image
    ? `<div class="link-card-image"><img src="${escapeHtml(ogp.image)}" alt="" loading="lazy" /></div>`
    : '';

  const descHtml = ogp.description
    ? `<div class="link-card-description">${escapeHtml(ogp.description)}</div>`
    : '';

  return `<a href="${escapeHtml(ogp.url)}" class="link-card" target="_blank" rel="noopener noreferrer">
  ${imageHtml}
  <div class="link-card-body">
    <div class="link-card-title">${escapeHtml(ogp.title)}</div>
    ${descHtml}
    <div class="link-card-meta">
      <img class="link-card-favicon" src="${escapeHtml(ogp.favicon)}" alt="" width="16" height="16" loading="lazy" />
      <span class="link-card-domain">${escapeHtml(ogp.siteName)}</span>
    </div>
  </div>
</a>`;
}

function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

export async function processLinkCards(html: string): Promise<string> {
  const urlPattern =
    /<p>\s*(?:<a[^>]*href="([^"]*)"[^>]*>[^<]*<\/a>|([^\s<>]+))\s*<\/p>/g;

  const matches: { full: string; url: string; index: number }[] = [];
  let m: RegExpExecArray | null;

  while ((m = urlPattern.exec(html)) !== null) {
    const url = m[1] ?? m[2] ?? '';
    if (!url.startsWith('http') || isYouTubeUrl(url)) continue;
    matches.push({ full: m[0], url, index: m.index });
  }

  if (matches.length === 0) return html;

  const ogpResults = await Promise.all(
    matches.map(({ url }) => fetchOGP(url).catch(() => null))
  );

  let result = html;
  for (let i = matches.length - 1; i >= 0; i--) {
    const ogp = ogpResults[i];
    if (!ogp?.title) continue;
    const { full, index } = matches[i];
    result = result.slice(0, index) + renderLinkCard(ogp) + result.slice(index + full.length);
  }

  return result;
}
