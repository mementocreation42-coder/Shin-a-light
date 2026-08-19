import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/adminAuth';
import { updateIssue, deleteIssue } from '@/lib/issues';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { id } = await params;

  let body: { subject?: string; preheader?: string; bodyMd?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const updated = await updateIssue(id, {
    subject: body.subject,
    preheader: body.preheader,
    bodyMd: body.bodyMd,
  });

  // 下書き以外は updateIssue が何も返さない（配信済みの号は書き換えさせない）
  if (!updated) {
    return NextResponse.json(
      { error: 'この号は編集できません。配信済みか、すでに削除されています。' },
      { status: 409 }
    );
  }

  return NextResponse.json({ updatedAt: updated.updated_at });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { id } = await params;

  const ok = await deleteIssue(id);
  if (!ok) {
    return NextResponse.json(
      { error: '配信済みの号は削除できません。' },
      { status: 409 }
    );
  }

  return NextResponse.json({ success: true });
}
