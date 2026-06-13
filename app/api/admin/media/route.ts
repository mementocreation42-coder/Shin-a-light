import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const WP_REST_BASE = 'https://journal.shinealight.jp/index.php?rest_route=/wp/v2';

function authHeader(): string {
  const user = process.env.WORDPRESS_APP_USERNAME!;
  const pass = process.env.WORDPRESS_APP_PASSWORD!;
  return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get('sal_admin_auth')?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') || '1';
  const search = searchParams.get('search') || '';
  const year = searchParams.get('year') || '';
  const month = searchParams.get('month') || '';

  const params = new URLSearchParams({
    per_page: '60',
    page,
    media_type: 'image',
    orderby: 'date',
    order: 'desc',
    _fields: 'id,source_url,alt_text,title,media_details',
  });
  if (search) params.set('search', search);
  if (year && month) {
    const y = parseInt(year), m = parseInt(month);
    const after = new Date(y, m - 1, 1).toISOString();
    const before = new Date(y, m, 0, 23, 59, 59).toISOString();
    params.set('after', after);
    params.set('before', before);
  } else if (year) {
    params.set('after', new Date(parseInt(year), 0, 1).toISOString());
    params.set('before', new Date(parseInt(year), 11, 31, 23, 59, 59).toISOString());
  }

  const res = await fetch(`${WP_REST_BASE}/media&${params.toString()}`, {
    headers: { Authorization: authHeader() },
    cache: 'no-store',
  });

  if (!res.ok) return NextResponse.json({ error: 'Failed' }, { status: res.status });

  const items = await res.json();
  const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
  return NextResponse.json({ items, totalPages });
}

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get('sal_admin_auth')?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { ids } = await req.json() as { ids: number[] };
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'No ids' }, { status: 400 });
  }

  const results = await Promise.allSettled(
    ids.map(async (id) => {
      const url = `${WP_REST_BASE}/media/${id}&force=true`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: authHeader(),
          'X-HTTP-Method-Override': 'DELETE',
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`${res.status}: ${body}`);
      }
      return id;
    })
  );

  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map((r) => r.reason?.message ?? String(r.reason));

  return NextResponse.json({
    deleted: ids.length - errors.length,
    failed: errors.length,
    errors,
  });
}
