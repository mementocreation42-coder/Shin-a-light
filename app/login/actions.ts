'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  SESSION_COOKIE, PENDING_COOKIE,
  SESSION_MAX_AGE_SEC, SESSION_SHORT_MAX_AGE_SEC, PENDING_MAX_AGE_SEC,
  signToken, signPayload, readToken, verifyTotp, verifyPassword, isTotpEnabled,
} from '@/lib/adminAuth';

export interface LoginState {
  error: string;
  /** 'password' … パスワード入力中 / 'totp' … 認証コード待ち */
  stage: 'password' | 'totp';
}

/** TOTP の連続失敗をここで打ち切り、パスワード段階からやり直させる */
const MAX_TOTP_ATTEMPTS = 5;

/** 認証失敗時の一律ウェイト。総当たりの試行速度を落とす */
const FAIL_DELAY_MS = 1500;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * ログイン後のリダイレクト先はサイト内のパスに限定する。
 * 絶対 URL・`//host` 形式を通すとオープンリダイレクト（フィッシングの踏み台）になる。
 */
function safeInternalPath(from: FormDataEntryValue | null): string {
  const v = typeof from === 'string' ? from : '';
  if (!v.startsWith('/') || v.startsWith('//') || v.includes('\\')) return '/admin';
  return v;
}

const cookieBase = {
  httpOnly: true as const,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

async function startSession(remember: boolean) {
  const cookieStore = await cookies();
  const maxAge = remember ? SESSION_MAX_AGE_SEC : SESSION_SHORT_MAX_AGE_SEC;
  cookieStore.set(SESSION_COOKIE, await signToken('session', maxAge), {
    ...cookieBase,
    // remember を外した場合は maxAge を付けない＝ブラウザ終了で消えるセッション Cookie。
    // トークン自体の exp（24h）が上限として残る。
    ...(remember ? { maxAge } : {}),
  });
  cookieStore.delete(PENDING_COOKIE);
}

/** 第1段階：パスワード照合 */
export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = (formData.get('password') as string) || '';
  const from = safeInternalPath(formData.get('from'));
  const remember = formData.get('remember') === 'on';

  // 未設定なら verifyPassword が常に false ＝ ログイン不能（fail closed）
  if (!(await verifyPassword(password))) {
    await sleep(FAIL_DELAY_MS);
    return { error: 'パスワードが違います', stage: 'password' };
  }

  // 認証アプリが未設定の環境ではパスワードのみで通す（設定前にロックアウトさせない）
  if (!isTotpEnabled()) {
    await startSession(remember);
    redirect(from);
  }

  const cookieStore = await cookies();
  const exp = Math.floor(Date.now() / 1000) + PENDING_MAX_AGE_SEC;
  cookieStore.set(PENDING_COOKIE, await signPayload({ kind: 'pending', exp, remember }), {
    ...cookieBase,
    maxAge: PENDING_MAX_AGE_SEC,
  });

  return { error: '', stage: 'totp' };
}

/** 第2段階：認証アプリの6桁コード照合 */
export async function verifyCode(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const code = (formData.get('code') as string) || '';
  const from = safeInternalPath(formData.get('from'));

  const cookieStore = await cookies();
  const pending = await readToken(cookieStore.get(PENDING_COOKIE)?.value, 'pending');

  // パスワード段階を踏んでいない、または5分を過ぎている
  if (!pending) {
    cookieStore.delete(PENDING_COOKIE);
    return { error: '時間切れです。パスワードから入力し直してください', stage: 'password' };
  }

  if (!(await verifyTotp(code))) {
    await sleep(FAIL_DELAY_MS);

    // 失敗回数は署名付き pending トークン側に持つ（クライアントは改ざんできない）
    const attempts = (pending.attempts ?? 0) + 1;
    if (attempts >= MAX_TOTP_ATTEMPTS) {
      cookieStore.delete(PENDING_COOKIE);
      return { error: '失敗が続いたため、パスワードから入力し直してください', stage: 'password' };
    }

    const remainingSec = Math.max(1, pending.exp - Math.floor(Date.now() / 1000));
    cookieStore.set(PENDING_COOKIE, await signPayload({ ...pending, attempts }), {
      ...cookieBase,
      maxAge: remainingSec,
    });
    return { error: `認証コードが違います（あと${MAX_TOTP_ATTEMPTS - attempts}回）`, stage: 'totp' };
  }

  await startSession(pending.remember ?? true);
  redirect(from);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(PENDING_COOKIE);
  redirect('/login');
}
