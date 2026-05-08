import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function POST() {
  const cookieStore = await cookies();
  if (cookieStore.get('sal_admin_auth')?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
