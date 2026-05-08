import { NextRequest, NextResponse } from 'next/server';
import { fetchOGP } from '@/lib/ogp';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });

  const ogp = await fetchOGP(url);
  if (!ogp) return NextResponse.json({ error: 'Failed to fetch OGP' }, { status: 500 });

  return NextResponse.json(ogp);
}
