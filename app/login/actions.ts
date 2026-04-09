'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(prevState: { error: string }, formData: FormData) {
  const password = formData.get('password') as string;
  const from = (formData.get('from') as string) || '/admin';

  if (password === (process.env.ADMIN_PASSWORD || 'changeme')) {
    const cookieStore = await cookies();
    cookieStore.set('sal_admin_auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    redirect(from);
  }

  return { error: 'パスワードが違います' };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('sal_admin_auth');
  redirect('/login');
}
