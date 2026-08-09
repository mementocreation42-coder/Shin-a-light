import { NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/adminAuth';
import { revalidatePath } from 'next/cache';

export async function POST() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
