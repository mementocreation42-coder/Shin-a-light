import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeByToken } from '@/lib/newsletter';

/**
 * ワンクリック解除（RFC 8058）。
 *
 * 配信メールに付ける2つのヘッダから呼ばれる。
 *   List-Unsubscribe: <このURL>, <mailto:...>
 *   List-Unsubscribe-Post: List-Unsubscribe=One-Click
 *
 * Gmail はこれがある送信者を優遇し、無い送信者を迷惑メール報告に誘導する。
 * 受信者はメールの上部に出る「登録解除」を押すだけで済み、
 * 「解除できないから迷惑メール報告する」という最悪の流れを避けられる。
 *
 * 押した本人の操作なので、こちらは確認画面を挟まず即座に解除する。
 */
export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'token is required' }, { status: 400 });
  }

  try {
    const result = await unsubscribeByToken(token);
    if (result === 'invalid') {
      return NextResponse.json({ error: 'invalid token' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Newsletter] one-click unsubscribe failed:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
