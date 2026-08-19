import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/adminAuth';
import { getIssue } from '@/lib/issues';
import { isValidEmail } from '@/lib/newsletter';
import { renderIssueEmail } from '@/lib/email/templates';
import { sendEmail, currentProvider } from '@/lib/email/mailer';

/**
 * 自分宛のテスト送信。
 *
 * 一斉配信は押したら取り消せないので、その前に必ず実物を受信して確かめられるようにする。
 * 宛先は指定した1件だけで、名簿には一切触れない。
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { id } = await params;

  let body: { to?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const to = body.to?.trim();
  if (!to || !isValidEmail(to)) {
    return NextResponse.json(
      { error: '送信先のメールアドレスが正しくありません。' },
      { status: 400 }
    );
  }

  const issue = await getIssue(id);
  if (!issue) {
    return NextResponse.json({ error: '号が見つかりません。' }, { status: 404 });
  }

  const siteUrl = process.env.SITE_URL ?? 'https://www.shinealight.jp';
  const { html, text } = renderIssueEmail({
    subject: issue.subject || '（件名未設定）',
    preheader: issue.preheader,
    bodyMd: issue.body_md,
    unsubUrl: `${siteUrl}/newsletter/unsubscribe?token=test`,
  });

  try {
    const result = await sendEmail({
      // 本番の配信と取り違えないよう件名に印を付ける
      to,
      subject: `[テスト] ${issue.subject || '（件名未設定）'}`,
      html,
      text,
    });
    return NextResponse.json({ success: true, provider: result.provider });
  } catch (error) {
    console.error('[Newsletter] test send failed:', error);
    return NextResponse.json(
      {
        error: `送信に失敗しました（${currentProvider()}）: ${
          error instanceof Error ? error.message : 'unknown'
        }`,
      },
      { status: 502 }
    );
  }
}
