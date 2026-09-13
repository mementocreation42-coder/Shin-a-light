import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const dynamic = 'force-dynamic';

/**
 * SAL のエコシステム図（data/sal-map.html）をそのまま返す。
 * 元は SAL Studio/hub/sal-map.html。/admin 配下なので proxy のログインチェックが掛かる。
 */
export async function GET() {
  try {
    const html = await readFile(join(process.cwd(), 'data', 'sal-map.html'), 'utf8');
    return new Response(html, {
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
    });
  } catch {
    return new Response('sal-map.html が見つかりません', { status: 404 });
  }
}
