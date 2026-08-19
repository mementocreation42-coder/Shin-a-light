import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/adminAuth';
import { renderIssueEmail } from '@/lib/email/templates';

/**
 * エディタの内容をメールHTMLに変換して返す。
 * 保存とは独立させ、書きながら見た目を確認できるようにしている。
 */
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: { subject?: string; preheader?: string; bodyMd?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const { html } = renderIssueEmail({
    subject: body.subject || '（件名未設定）',
    preheader: body.preheader,
    bodyMd: body.bodyMd || '',
    // プレビューなので解除リンクは踏んでも無害なダミーにしておく
    unsubUrl: '#preview',
  });

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
