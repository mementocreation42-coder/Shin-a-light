'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  SESSION_COOKIE, PENDING_COOKIE,
  SESSION_MAX_AGE_SEC, PENDING_MAX_AGE_SEC,
  signToken, verifyToken, verifyTotp, isTotpEnabled,
} from '@/lib/adminAuth';

export interface LoginState {
  error: string;
  /** 'password' … パスワード入力中 / 'totp' … 認証コード待ち */
  stage: 'password' | 'totp';
}

const cookieBase = {
  httpOnly: true as const,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

async function startSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, await signToken('session', SESSION_MAX_AGE_SEC), {
    ...cookieBase,
    maxAge: SESSION_MAX_AGE_SEC,
  });
  cookieStore.delete(PENDING_COOKIE);
}

/** 第1段階：パスワード照合 */
export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get('password') as string;
  const from = (formData.get('from') as string) || '/admin';

  if (password !== (process.env.ADMIN_PASSWORD || 'changeme')) {
    return { error: 'パスワードが違います', stage: 'password' };
  }

  // 認証アプリが未設定の環境ではパスワードのみで通す（設定前にロックアウトさせない）
  if (!isTotpEnabled()) {
    await startSession();
    redirect(from);
  }

  const cookieStore = await cookies();
  cookieStore.set(PENDING_COOKIE, await signToken('pending', PENDING_MAX_AGE_SEC), {
    ...cookieBase,
    maxAge: PENDING_MAX_AGE_SEC,
  });

  return { error: '', stage: 'totp' };
}

/** 第2段階：認証アプリの6桁コード照合 */
export async function verifyCode(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const code = (formData.get('code') as string) || '';
  const from = (formData.get('from') as string) || '/admin';

  const cookieStore = await cookies();
  const pending = cookieStore.get(PENDING_COOKIE)?.value;

  // パスワード段階を踏んでいない、または5分を過ぎている
  if (!(await verifyToken(pending, 'pending'))) {
    cookieStore.delete(PENDING_COOKIE);
    return { error: '時間切れです。パスワードから入力し直してください', stage: 'password' };
  }

  if (!(await verifyTotp(code))) {
    return { error: '認証コードが違います', stage: 'totp' };
  }

  await startSession();
  redirect(from);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(PENDING_COOKIE);
  redirect('/login');
}
