import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/adminAuth';
import { renderIssueEmail, renderConfirmEmail, renderWelcomeEmail } from '@/lib/email/templates';

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

/**
 * 自動送信メール（システムメール）のプレビュー。
 * ?template=confirm | welcome を実データと同じテンプレートで描画して返す。
 * リンク先はすべて無害なサンプル値。
 */
export async function GET(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const template = req.nextUrl.searchParams.get('template');
  const origin = process.env.SITE_URL ?? 'https://www.shinealight.jp';

  let html: string;
  if (template === 'confirm') {
    ({ html } = renderConfirmEmail(`${origin}/newsletter/confirm?token=PREVIEW`));
  } else if (template === 'welcome') {
    ({ html } = renderWelcomeEmail({
      presetUrl: `${origin}/presets/selpico3.xmp`,
      unsubUrl: `${origin}/newsletter/unsubscribe?token=PREVIEW`,
    }));
  } else {
    return NextResponse.json({ error: 'unknown template' }, { status: 400 });
  }

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
