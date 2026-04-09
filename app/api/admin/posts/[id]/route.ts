import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { updateWPPost, deleteWPPost } from '@/lib/wordpress';

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

  for (const para of fields.body.split('\n\n')) {
    const trimmed = para.trim();
    if (!trimmed) continue;

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

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get('sal_admin_auth')?.value === 'true';
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

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

    const content = buildContent({ body, imageUrls: uploaded, products });

    const updateData: Parameters<typeof updateWPPost>[1] = {
      title,
      content,
      date,
      categories: categoryIds,
      status: postStatus,
    };
    if (uploaded[0]) updateData.featured_media = uploaded[0].id;

    const post = await updateWPPost(parseInt(id, 10), updateData);
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, post });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    await deleteWPPost(parseInt(id, 10));
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
