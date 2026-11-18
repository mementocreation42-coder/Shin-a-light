import { createPrivateKey, sign } from 'node:crypto';
import { getSql } from '@/lib/db';
import { normalizeEmail } from '@/lib/newsletter';
import { sendEmail } from '@/lib/email/mailer';
import { renderGoldroomEmail } from '@/lib/email/templates';

/**
 * GoldRoom（Mac の RAW 現像アプリ）の利用コード。ニュースレター読者だけが使える。
 *
 * コード = "GR1." + base64url(JSON {v, e: メール, d: 発行日}) + "." + base64url(Ed25519 署名)
 * アプリは中に入れた公開鍵で署名を確かめるだけ（照合に通信は要らない）。
 * 秘密鍵は環境変数 GOLDROOM_SIGNING_KEY（PKCS8 DER の base64）。持ち主の Mac では Keychain の
 * goldroom-signing-key にも控えがある。鍵を作り直すと、配ったコードが全部使えなくなる。
 *
 * dmg の置き場は GOLDROOM_DOWNLOAD_URL（Google ドライブの共有リンクなど）。
 * 2 つとも揃っていないあいだは、ウェルカムメールに GoldRoom を載せない。
 */

export function isGoldroomConfigured(): boolean {
  return Boolean(process.env.GOLDROOM_SIGNING_KEY && process.env.GOLDROOM_DOWNLOAD_URL);
}

function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function issueGoldroomCode(rawEmail: string, now = new Date()): string {
  const key = process.env.GOLDROOM_SIGNING_KEY;
  if (!key) throw new Error('GOLDROOM_SIGNING_KEY is not set');
  const privateKey = createPrivateKey({ key: Buffer.from(key, 'base64'), format: 'der', type: 'pkcs8' });
  const payload = Buffer.from(
    JSON.stringify({ v: 1, e: normalizeEmail(rawEmail), d: now.toISOString().slice(0, 10) }),
    'utf8'
  );
  const sig = sign(null, payload, privateKey);
  return `GR1.${b64url(payload)}.${b64url(sig)}`;
}

export interface GoldroomLinks {
  code: string;
  downloadUrl: string;
  /** コードを表示して「GoldRoom で開く」を押せるページ（メールのアプリはカスタム URL を消すことがあるので、いったん https で受ける） */
  activateUrl: string;
}

export function goldroomLinks(email: string, origin: string): GoldroomLinks {
  const code = issueGoldroomCode(email);
  return {
    code,
    downloadUrl: process.env.GOLDROOM_DOWNLOAD_URL ?? '',
    activateUrl: `${origin}/goldroom/activate?code=${encodeURIComponent(code)}`,
  };
}

/** 同じ相手にコードを送り直すまでの最短間隔（メール爆撃に使わせない） */
const RESEND_INTERVAL_MS = 5 * 60 * 1000;

/**
 * 購読中の人にコードを送る（/goldroom のフォームから。前に受け取った人の再送も兼ねる）。
 * 購読中でない・間隔が短い・未設定のときは何もしない。呼び出し側は結果の違いを利用者に見せない。
 */
export async function sendGoldroomCodeIfActive(rawEmail: string, origin: string): Promise<boolean> {
  if (!isGoldroomConfigured()) return false;
  const sql = getSql();
  const email = normalizeEmail(rawEmail);
  const rows = await sql<{ unsub_token: string }>`
    update subscribers
       set goldroom_sent_at = now()
     where email = ${email}
       and status = 'active'
       and (goldroom_sent_at is null or goldroom_sent_at < ${new Date(Date.now() - RESEND_INTERVAL_MS).toISOString()})
     returning unsub_token
  `;
  if (rows.length === 0) return false;
  const links = goldroomLinks(email, origin);
  const mail = renderGoldroomEmail({
    ...links,
    unsubUrl: `${origin}/newsletter/unsubscribe?token=${encodeURIComponent(rows[0].unsub_token)}`,
  });
  await sendEmail({ to: email, subject: '【Shine a Light】GoldRoom の利用コード', html: mail.html, text: mail.text });
  return true;
}
