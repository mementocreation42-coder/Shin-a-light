const AMAZON_TAG = 'enigamid-22';
const RAKUTEN_TAG = '10e021c5.0d5d8fee.10e021c6.4a09ea17';

function addAmazonTag(url: string): string {
  if (!url) return '';
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    if (!u.searchParams.has('tag')) u.searchParams.set('tag', AMAZON_TAG);
    return u.toString();
  } catch {
    return url.includes('tag=') ? url : `${url}${url.includes('?') ? '&' : '?'}tag=${AMAZON_TAG}`;
  }
}

function addRakutenTag(url: string): string {
  if (!url) return '';
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    if (!u.searchParams.has('afid')) u.searchParams.set('afid', RAKUTEN_TAG);
    return u.toString();
  } catch {
    return url;
  }
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// --- メタデータ取得 (サーバーサイド直接解析) ---

function extractAsin(url: string): string | null {
  const m = url.match(/(?:dp|gp\/product|ASIN)\/([A-Z0-9]{10})/i);
  return m ? m[1] : null;
}

function parseJsonLd(html: string) {
  const result: Record<string, string> = {};
  for (const m of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(m[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item['@type'] === 'Product' || item.name) {
          if (!result.title && item.name) result.title = item.name;
          if (!result.image && item.image) result.image = Array.isArray(item.image) ? item.image[0] : item.image;
          if (!result.brand && item.brand?.name) result.brand = item.brand.name;
          if (!result.price && item.offers) {
            const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
            if (offer?.price) result.price = `￥${Number(offer.price).toLocaleString('ja-JP')}`;
          }
        }
      }
    } catch { /* skip */ }
  }
  return result;
}

function parseAmazonHtml(html: string) {
  const result: Record<string, string> = {};
  const titleM = html.match(/id="productTitle"[^>]*>([\s\S]*?)<\/span/i)
    || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleM) result.title = titleM[1].replace(/<[^>]+>/g, '').trim();
  const imgM = html.match(/"hiRes"\s*:\s*"(https:[^"]+)"/i)
    || html.match(/"large"\s*:\s*"(https:[^"]+)"/i)
    || html.match(/id="landingImage"[^>]*src="([^"]+)"/i);
  if (imgM) result.image = imgM[1];
  const priceM = html.match(/<span class="a-price-whole">([\d,]+)/i)
    || html.match(/[￥¥]\s*([\d,]+)/i);
  if (priceM) result.price = `￥${priceM[1].replace(/[^\d,]/g, '')}`;
  const brandM = html.match(/id="bylineInfo"[^>]*>[\s\S]*?(?:ブランド|Brand)[:\s：]*<\/span>\s*<span[^>]*>([^<]+)/i);
  if (brandM) {
    const b = brandM[1].trim();
    if (b && !/WEBLAB|REGARDLESS|TREATMENT/i.test(b)) result.brand = b;
  }
  return result;
}

function parseOgp(html: string) {
  const titleM = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)
    || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i);
  const imageM = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
    || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
  return { title: titleM?.[1], image: imageM?.[1] };
}

async function fetchProductMetadata(url: string): Promise<Record<string, string>> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ja-JP,ja;q=0.9',
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return {};
    const html = await res.text();
    const asin = extractAsin(url);
    const jld = parseJsonLd(html);
    const amz = parseAmazonHtml(html);
    const ogp = parseOgp(html);
    return {
      title: (jld.title || amz.title || ogp.title || '').replace(/Amazon\.co\.jp[:\s|：]*/gi, '').trim(),
      image: jld.image || amz.image || ogp.image || (asin ? `https://m.media-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_SX500_.jpg` : ''),
      price: jld.price || amz.price || '',
      brand: jld.brand || amz.brand || '',
    };
  } catch {
    return {};
  }
}

// --- カードHTML生成 ---

interface ProductData {
  amazonUrl: string;
  rakutenUrl: string;
  title: string;
  image: string;
  price: string;
  brand: string;
}

function renderCard(data: ProductData): string {
  const amazon = data.amazonUrl ? addAmazonTag(data.amazonUrl) : '';
  const rakuten = data.rakutenUrl ? addRakutenTag(data.rakutenUrl) : '';

  const imageHtml = data.image
    ? `<div class="sal-affiliate-image"><img src="${escapeAttr(data.image)}" alt="${escapeAttr(data.title)}" loading="lazy" /></div>`
    : '';

  const brandHtml = data.brand
    ? `<div class="sal-affiliate-brand">${escapeAttr(data.brand)}</div>` : '';

  const priceHtml = data.price
    ? `<div class="sal-affiliate-price">${escapeAttr(data.price)}<span class="sal-affiliate-tax">（税込）</span></div>` : '';

  const amazonBtn = amazon
    ? `<a href="${escapeAttr(amazon)}" class="sal-affiliate-btn sal-affiliate-btn--amazon" target="_blank" rel="noopener noreferrer sponsored"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" width="50" height="12" class="sal-affiliate-amazon-logo" /><span>で探す</span></a>`
    : '';

  const rakutenBtn = rakuten
    ? `<a href="${escapeAttr(rakuten)}" class="sal-affiliate-btn sal-affiliate-btn--rakuten" target="_blank" rel="noopener noreferrer sponsored"><span class="sal-affiliate-rakuten-r">R</span><span>楽天で探す</span></a>`
    : '';

  return `<div class="sal-affiliate-card">
  ${imageHtml}
  <div class="sal-affiliate-body">
    ${brandHtml}
    <h3 class="sal-affiliate-title">${escapeAttr(data.title)}</h3>
    <div class="sal-affiliate-footer">
      ${priceHtml}
      <div class="sal-affiliate-buttons">${amazonBtn}${rakutenBtn}</div>
    </div>
  </div>
</div>`;
}

function getAttr(attrs: string, name: string): string {
  const m = attrs.match(new RegExp(`data-${name}="([^"]*)"`));
  return m ? m[1] : '';
}

/** Amazon / 楽天 URL かどうか判定 */
export function isAffiliateUrl(url: string): boolean {
  return /(?:amazon\.co\.jp|amzn\.to|amzn\.asia|item\.rakuten\.co\.jp|search\.rakuten\.co\.jp|rakuten\.co\.jp\/item)/i.test(url);
}

type MatchEntry =
  | { type: 'div'; full: string; attrs: string; index: number }
  | { type: 'url'; full: string; url: string; index: number; prefix?: string };

/** 記事HTML内のアフィリカードを変換する
 *  - <div class="hl-product-card" ...> タグ
 *  - <p> 内の単独 Amazon / 楽天 URL（<br> 後パターンも含む）
 */
export async function processAffiliateCards(html: string): Promise<string> {
  const matches: MatchEntry[] = [];
  let m: RegExpExecArray | null;

  // パターン1: <div class="hl-product-card" ...>
  const divPattern = /<div[^>]+class="[^"]*hl-product-card[^"]*"([^>]*)(?:\/>|>\s*<\/div>)/g;
  while ((m = divPattern.exec(html)) !== null) {
    matches.push({ type: 'div', full: m[0], attrs: m[1], index: m.index });
  }

  // パターン2: <p> 内に単独 URL（<a>タグあり・なし両対応）
  const soloPattern = /<p>\s*(?:<a[^>]*href="([^"]*)"[^>]*>[^<]*<\/a>|([^\s<>]+))\s*<\/p>/g;
  while ((m = soloPattern.exec(html)) !== null) {
    const url = m[1] ?? m[2] ?? '';
    if (!url.startsWith('http') || !isAffiliateUrl(url)) continue;
    matches.push({ type: 'url', full: m[0], url, index: m.index });
  }

  // パターン3: <p>テキスト<br>URL</p>
  const brPattern = /<p>((?:(?!<br).)+?)<br\s*\/?>\s*(?:<a[^>]*href="([^"]*)"[^>]*>[^<]*<\/a>|([^\s<>]+))\s*<\/p>/g;
  while ((m = brPattern.exec(html)) !== null) {
    const url = m[2] ?? m[3] ?? '';
    if (!url.startsWith('http') || !isAffiliateUrl(url)) continue;
    const alreadyMatched = matches.some(ex => m!.index >= ex.index && m!.index < ex.index + ex.full.length);
    if (alreadyMatched) continue;
    matches.push({ type: 'url', full: m[0], url, index: m.index, prefix: `<p>${m[1]}</p>` });
  }

  if (matches.length === 0) return html;

  matches.sort((a, b) => a.index - b.index);

  const cards = await Promise.all(
    matches.map(async (entry) => {
      if (entry.type === 'div') {
        const { attrs } = entry;
        const amazonUrl = getAttr(attrs, 'amazon-url');
        const rakutenUrl = getAttr(attrs, 'rakuten-url');
        let title = getAttr(attrs, 'title');
        let image = getAttr(attrs, 'image');
        const price = getAttr(attrs, 'price');
        const brand = getAttr(attrs, 'brand');

        if (!title || !image) {
          const sourceUrl = amazonUrl || rakutenUrl;
          if (sourceUrl) {
            const meta = await fetchProductMetadata(sourceUrl);
            title = title || meta.title || '';
            image = image || meta.image || '';
          }
        }
        if (!title && !image) return null;
        return { card: renderCard({ amazonUrl, rakutenUrl, title, image, price, brand }), prefix: undefined };
      } else {
        const { url } = entry;
        const meta = await fetchProductMetadata(url);
        if (!meta.title && !meta.image) return null;
        const isAmazon = /amazon\.co\.jp|amzn\.to|amzn\.asia/i.test(url);
        return {
          card: renderCard({
            amazonUrl: isAmazon ? url : '',
            rakutenUrl: isAmazon ? '' : url,
            title: meta.title || '',
            image: meta.image || '',
            price: meta.price || '',
            brand: meta.brand || '',
          }),
          prefix: (entry as Extract<MatchEntry, { type: 'url' }>).prefix,
        };
      }
    })
  );

  let result = html;
  for (let i = matches.length - 1; i >= 0; i--) {
    const res = cards[i];
    if (!res) continue;
    const { full, index } = matches[i];
    const replacement = (res.prefix ?? '') + res.card;
    result = result.slice(0, index) + replacement + result.slice(index + full.length);
  }
  return result;
}
