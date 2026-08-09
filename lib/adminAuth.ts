// 管理画面の認証。proxy（Edge ランタイム）とサーバーアクションの両方から使うため、
// node:crypto ではなく Web Crypto のみで組み立てている。

export const SESSION_COOKIE = 'sal_admin_session';
export const PENDING_COOKIE = 'sal_admin_pending';

export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30;
// パスワード通過から TOTP 入力までの猶予
export const PENDING_MAX_AGE_SEC = 5 * 60;

interface TokenPayload {
  /** 用途。セッションと 2FA 待ちのトークンを取り違えないための識別子 */
  kind: 'session' | 'pending';
  /** 失効時刻（UNIX 秒） */
  exp: number;
}

// ===== base64url =====
function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ===== 署名鍵 =====
// 専用のシークレットがなければパスワードから導出する。
// 導出した場合はパスワード変更で全セッションが失効する（望ましい挙動）。
function secretMaterial(): string {
  const explicit = process.env.ADMIN_SESSION_SECRET;
  if (explicit) return explicit;
  return `derived:${process.env.ADMIN_PASSWORD || 'changeme'}`;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secretMaterial()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

/** 長さを漏らさずバイト列を比較する */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** `<payload>.<signature>` 形式の署名付きトークンを作る */
export async function signToken(kind: TokenPayload['kind'], maxAgeSec: number): Promise<string> {
  const payload: TokenPayload = { kind, exp: Math.floor(Date.now() / 1000) + maxAgeSec };
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(), new TextEncoder().encode(body));
  return `${body}.${toBase64Url(new Uint8Array(sig))}`;
}

/** 署名と有効期限を検証する。用途が一致しないトークンは拒否する */
export async function verifyToken(
  token: string | undefined,
  kind: TokenPayload['kind']
): Promise<boolean> {
  if (!token) return false;
  const dot = token.lastIndexOf('.');
  if (dot < 1) return false;

  const body = token.slice(0, dot);
  let providedSig: Uint8Array;
  try { providedSig = fromBase64Url(token.slice(dot + 1)); } catch { return false; }

  const expectedSig = new Uint8Array(
    await crypto.subtle.sign('HMAC', await hmacKey(), new TextEncoder().encode(body))
  );
  if (!timingSafeEqual(providedSig, expectedSig)) return false;

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as TokenPayload;
    if (payload.kind !== kind) return false;
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

/**
 * API ルートから使う認証チェック。
 * proxy は /admin 配下しか守らないので、/api/admin 側は各ルートでこれを呼ぶ。
 */
export async function isAdminAuthed(): Promise<boolean> {
  // next/headers はサーバー側でのみ解決できるため、ここで動的に読み込む
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return verifyToken(cookieStore.get(SESSION_COOKIE)?.value, 'session');
}

// ===== TOTP（RFC 6238 / SHA-1 / 6桁 / 30秒）=====

export function isTotpEnabled(): boolean {
  return Boolean(process.env.ADMIN_TOTP_SECRET);
}

function base32Decode(input: string): ArrayBuffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = input.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = alphabet.indexOf(ch);
    if (idx === -1) throw new Error('invalid base32');
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  const bytes = new Uint8Array(new ArrayBuffer(out.length));
  bytes.set(out);
  return bytes.buffer;
}

async function totpAt(secret: ArrayBuffer, counter: number): Promise<string> {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  // カウンタは 64bit。JS の数値で扱える上位32bitは実質0だが、規格どおり両方書く
  view.setUint32(0, Math.floor(counter / 2 ** 32));
  view.setUint32(4, counter >>> 0);

  const key = await crypto.subtle.importKey(
    'raw',
    secret,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const hmac = new Uint8Array(await crypto.subtle.sign('HMAC', key, buf));

  // 動的切り出し（RFC 4226 §5.3）
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3];
  return String(binary % 1_000_000).padStart(6, '0');
}

/**
 * 認証アプリの6桁コードを検証する。
 * 端末の時計ずれを見込んで前後1ステップ（±30秒）まで許容する。
 */
export async function verifyTotp(code: string): Promise<boolean> {
  const rawSecret = process.env.ADMIN_TOTP_SECRET;
  if (!rawSecret) return false;

  const normalized = code.replace(/\D/g, '');
  if (normalized.length !== 6) return false;

  let secret: ArrayBuffer;
  try { secret = base32Decode(rawSecret); } catch { return false; }

  const counter = Math.floor(Date.now() / 1000 / 30);
  for (const drift of [0, -1, 1]) {
    const expected = await totpAt(secret, counter + drift);
    if (timingSafeEqual(new TextEncoder().encode(expected), new TextEncoder().encode(normalized))) {
      return true;
    }
  }
  return false;
}
