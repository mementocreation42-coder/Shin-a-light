import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/adminAuth';
import { isDbConfigured } from '@/lib/db';
import { addSubscribers, extractEmails } from '@/lib/newsletter';

/**
 * 管理画面からの手動登録。
 *
 * 貼り付けた文字列をそのまま受け取り、アドレスらしいものを拾って名簿に入れる。
 * 確認メールは送らない。すでに同意をもらっている相手を入れるための口なので、
 * ここを通す時点で同意は取れている前提になる。
 */

/** 一度に貼れる量の上限。多すぎるときは import スクリプトの領分 */
const MAX_LENGTH = 100_000;

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: 'データベースが未接続のため登録できません。' },
      { status: 503 }
    );
  }

  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const text = body.text ?? '';
  if (!text.trim()) {
    return NextResponse.json(
      { error: 'メールアドレスを入力してください。' },
      { status: 400 }
    );
  }
  if (text.length > MAX_LENGTH) {
    return NextResponse.json(
      { error: '一度に貼れる量を超えています。分けて登録してください。' },
      { status: 413 }
    );
  }

  const { emails, invalid } = extractEmails(text);
  if (emails.length === 0) {
    return NextResponse.json(
      { error: 'メールアドレスを読み取れませんでした。', invalid },
      { status: 400 }
    );
  }

  try {
    const result = await addSubscribers(emails);
    return NextResponse.json({ ...result, invalid });
  } catch (error) {
    console.error('[Subscribers] manual add failed:', error);
    return NextResponse.json({ error: '登録に失敗しました。' }, { status: 500 });
  }
}
