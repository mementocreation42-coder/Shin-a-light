import { NextRequest, NextResponse } from 'next/server';

const corsHeaders = { 'Access-Control-Allow-Origin': '*' };

// ASINをURLから抽出
function extractAsin(url: string): string | null {
  const match = url.match(/(?:dp|gp\/product|ASIN)\/([A-Z0-9]{10})/i);
  return match ? match[1] : null;
}

// ASINからAmazon画像URLを構築（CDN直アクセス）
function buildAmazonImageUrl(asin: string): string {
  return `https://m.media-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_SX500_.jpg`;
}

// フェッチ（1回分）
async function fetchPage(url: string, timeoutMs: number): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'identity',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

// リトライ付きフェッチ
async function fetchWithRetry(url: string, maxAttempts = 3): Promise<string> {
  let lastError: Error | null = null;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      if (i > 0) await new Promise(r => setTimeout(r, 800 * i)); // 0.8s, 1.6s ディレイ
      return await fetchPage(url, 15000);
    } catch (e: any) {
      lastError = e;
    }
  }
  throw lastError;
}

// JSON-LDからデータを抽出（最も安定）
function parseJsonLd(html: string): { title?: string; image?: string; price?: string; brand?: string } {
  const result: { title?: string; image?: string; price?: string; brand?: string } = {};
  const jsonLdMatches = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const match of jsonLdMatches) {
    try {
      const data = JSON.parse(match[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item['@type'] === 'Product' || item.name) {
          if (!result.title && item.name) result.title = item.name;
          if (!result.image && item.image) {
            result.image = Array.isArray(item.image) ? item.image[0] : item.image;
          }
          if (!result.brand && item.brand?.name) result.brand = item.brand.name;
          if (!result.price && item.offers) {
            const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
            if (offer?.price) result.price = `￥${Number(offer.price).toLocaleString('ja-JP')}`;
          }
        }
      }
    } catch {}
  }
  return result;
}

// OGPからデータを抽出
function parseOgp(html: string): { title?: string; image?: string } {
  const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)
    || html.match(/<meta\s+content="([^"]+)"\s+property="og:title"/i);
  const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)
    || html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/i);
  return {
    title: titleMatch?.[1],
    image: imageMatch?.[1],
  };
}

// Amazon固有のHTML要素からデータを抽出
function parseAmazonHtml(html: string): { title?: string; image?: string; price?: string; brand?: string } {
  const result: { title?: string; image?: string; price?: string; brand?: string } = {};

  // タイトル
  const titleMatch = html.match(/id="productTitle"[^>]*>([\s\S]*?)<\/span/i)
    || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    result.title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
  }

  // 画像（JSON埋め込みデータを優先）
  const hiResMatch = html.match(/"hiRes"\s*:\s*"(https:[^"]+)"/i)
    || html.match(/"large"\s*:\s*"(https:[^"]+)"/i)
    || html.match(/id="landingImage"[^>]*src="([^"]+)"/i)
    || html.match(/data-old-hires="([^"]+)"/i);
  if (hiResMatch) result.image = hiResMatch[1];

  // 価格
  const priceMatch = html.match(/<span class="a-price-whole">([\d,]+)/i)
    || html.match(/￥\s*([\d,]+)/i)
    || html.match(/¥\s*([\d,]+)/i);
  if (priceMatch) {
    const raw = priceMatch[1].replace(/[^\d,]/g, '').trim();
    if (raw) result.price = `￥${raw}`;
  }

  // ブランド
  const brandMatch = html.match(/id="bylineInfo"[^>]*>[\s\S]*?(?:ブランド|Brand)[:\s：]*<\/span>\s*<span[^>]*>([^<]+)/i)
    || html.match(/ブランド:\s*<\/td>\s*<td[^>]*>([^<]+)/i);
  if (brandMatch) {
    const b = brandMatch[1].replace(/<[^>]+>/g, '').trim();
    if (b && !/WEBLAB|REGARDLESS|TREATMENT/i.test(b)) result.brand = b;
  }

  return result;
}

// タイトルのAmazonゴミ除去
function cleanTitle(title: string): string {
  return title
    .replace(/Amazon\.co\.jp[:\s|：]+/gi, '')
    .replace(/[:\s|：]+Amazon(\.co\.jp)?$/gi, '')
    .replace(/^Amazon[:\s|：]+/gi, '')
    .trim();
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400, headers: corsHeaders });
  }

  // ASINを事前抽出（画像フォールバック用）
  const asin = extractAsin(url);

  try {
    const html = await fetchWithRetry(url);

    // 優先順位: JSON-LD → Amazonhtml → OGP の順にマージ
    const fromJsonLd = parseJsonLd(html);
    const fromAmazon = parseAmazonHtml(html);
    const fromOgp = parseOgp(html);

    const title = cleanTitle(fromJsonLd.title || fromAmazon.title || fromOgp.title || '');
    const image = fromJsonLd.image || fromAmazon.image || fromOgp.image
      || (asin ? buildAmazonImageUrl(asin) : '');  // 最終手段: ASIN直接構築
    const price = fromJsonLd.price || fromAmazon.price || '';
    const brand = fromJsonLd.brand || fromAmazon.brand || '';

    // タイトルすら取れなかった場合のみエラー
    if (!title && !image) {
      return NextResponse.json(
        { error: 'Could not extract product info. Amazon may be blocking the request.' },
        { status: 422, headers: corsHeaders }
      );
    }

    return NextResponse.json({ title, image, price, brand }, { headers: corsHeaders });

  } catch (error: any) {
    // フェッチ自体が全滅した場合でもASIN画像だけは返す
    if (asin) {
      return NextResponse.json(
        { title: '', image: buildAmazonImageUrl(asin), price: '', brand: '', warning: 'Fetch failed, image from ASIN only' },
        { headers: corsHeaders }
      );
    }
    const msg = error.name === 'AbortError' ? 'Fetch timeout (15s)' : (error.message || 'Internal server error');
    return NextResponse.json({ error: msg }, { status: 504, headers: corsHeaders });
  }
}
