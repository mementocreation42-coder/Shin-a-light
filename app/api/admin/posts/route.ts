import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createWPPost } from '@/lib/wordpress';

function escAttr(s: string) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

interface ProductData {
  amazonUrl: string; rakutenUrl: string;
  title: string; image: string; price: string; brand: string;
}

function buildContent(fields: {
  body: string;
  imageUrls: { url: string; id: number }[];
  products: ProductData[];
}): string {
  const blocks: string[] = [];

  const normalized = fields.body
    .replace(/\r\n/g, '\n')
    .replace(/\[(h2|h3)\]([\s\S]*?)\[\/\1\]/g, '\n\n[$1]$2[/$1]\n\n')
    .replace(/\[ul\]\s*([\s\S]*?)\s*\[\/ul\]/g, '\n\n[ul]\n$1\n[/ul]\n\n')
    .replace(/\[quote\]([\s\S]*?)\[\/quote\]/g, '\n\n[quote]$1[/quote]\n\n');

  for (const para of normalized.split(/\n\s*\n/)) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    const h2M = trimmed.match(/^\[h2\]([\s\S]*?)\[\/h2\]$/);
    const h3M = trimmed.match(/^\[h3\]([\s\S]*?)\[\/h3\]$/);
    const ulM = trimmed.match(/^\[ul\]\n?([\s\S]*?)\n?\[\/ul\]$/);
    const qtM = trimmed.match(/^\[quote\]([\s\S]*?)\[\/quote\]$/);
    if (h2M) {
      blocks.push(`<!-- wp:heading {"level":2} -->\n<h2 class="wp-block-heading">${h2M[1].trim()}</h2>\n<!-- /wp:heading -->`);
      continue;
    }
    if (h3M) {
      blocks.push(`<!-- wp:heading {"level":3} -->\n<h3 class="wp-block-heading">${h3M[1].trim()}</h3>\n<!-- /wp:heading -->`);
      continue;
    }
    if (ulM) {
      const items = ulM[1].split('\n').filter(Boolean).map(l => `<li>${l.trim()}</li>`).join('');
      blocks.push(`<!-- wp:list -->\n<ul class="wp-block-list">${items}</ul>\n<!-- /wp:list -->`);
      continue;
    }
    if (qtM) {
      blocks.push(`<!-- wp:quote -->\n<blockquote class="wp-block-quote"><p>${qtM[1].trim()}</p></blockquote>\n<!-- /wp:quote -->`);
      continue;
    }

    for (const part of trimmed.split(/(\[(?:image|product):\d+\])/)) {
      const imgM = part.match(/^\[image:(\d+)\]$/);
      const prodM = part.match(/^\[product:(\d+)\]$/);
      if (imgM) {
        const img = fields.imageUrls[parseInt(imgM[1], 10)];
        if (img) blocks.push(
          `<!-- wp:image {"id":${img.id}} -->\n<figure class="wp-block-image"><img src="${escAttr(img.url)}" class="wp-image-${img.id}" /></figure>\n<!-- /wp:image -->`
        );
      } else if (prodM) {
        const p = fields.products[parseInt(prodM[1], 10)];
        if (p) blocks.push(
          `<!-- wp:html -->\n<div class="hl-product-card" data-amazon-url="${escAttr(p.amazonUrl)}" data-rakuten-url="${escAttr(p.rakutenUrl)}" data-title="${escAttr(p.title)}" data-image="${escAttr(p.image)}" data-price="${escAttr(p.price)}" data-brand="${escAttr(p.brand)}"></div>\n<!-- /wp:html -->`
        );
      } else if (part.trim()) {
        blocks.push(`<!-- wp:paragraph -->\n<p>${part.replace(/\n/g, '<br>')}</p>\n<!-- /wp:paragraph -->`);
      }
    }
  }

  return blocks.join('\n');
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get('sal_admin_auth')?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const date = formData.get('date') as string;
    const body = formData.get('body') as string || '';
    const categoryIds = formData.getAll('categoryIds').map((v) => parseInt(v as string, 10)).filter(Boolean);
    const products: ProductData[] = JSON.parse(formData.get('products') as string || '[]');
    const postStatus = (formData.get('postStatus') as string) === 'draft' ? 'draft' : 'publish';
    const imageUrls = formData.getAll('imageUrls') as string[];
    const imageIds = formData.getAll('imageIds').map((v) => parseInt(v as string, 10));
    const uploaded = imageUrls.map((url, i) => ({ url, id: imageIds[i] || 0 }));
    const eyecatchIdRaw = formData.get('eyecatchId');
    const eyecatchId = eyecatchIdRaw !== null ? parseInt(eyecatchIdRaw as string, 10) : (uploaded[0]?.id || 0);

    const content = buildContent({ body, imageUrls: uploaded, products });

    const post = await createWPPost({
      title,
      content,
      date,
      status: postStatus,
      categories: categoryIds,
      featured_media: eyecatchId,
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, post });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
