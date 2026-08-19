import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * 送信サービスの抽象層。
 *
 * 到達率(IPレピュテーション・DKIM署名・バウンス処理)は外部サービスに任せる。
 * どのサービスを使うかがこのファイルの外に漏れないようにしておけば、
 * 無料枠を使い切ったときに Resend ⇄ Brevo を差し替えるだけで済む。
 *
 * MAIL_PROVIDER で選ぶ。未設定なら outbox（ローカルのファイルに書き出す）。
 * outbox のおかげで、アカウントを作る前でも送信処理を通しで試せる。
 */

export interface SendParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** List-Unsubscribe など。Gmail の一括送信者要件で必要になる */
  headers?: Record<string, string>;
}

export interface SendResult {
  /** 送信サービス側のID。あとでバウンス通知と突き合わせるために保存する */
  id: string;
  provider: string;
}

export type MailProvider = 'resend' | 'brevo' | 'outbox';

export function currentProvider(): MailProvider {
  const explicit = process.env.MAIL_PROVIDER as MailProvider | undefined;
  if (explicit) return explicit;
  if (process.env.RESEND_API_KEY) return 'resend';
  if (process.env.BREVO_API_KEY) return 'brevo';
  return 'outbox';
}

function fromAddress(): { email: string; name: string } {
  return {
    email: process.env.MAIL_FROM ?? 'newsletter@mail.shinealight.jp',
    name: process.env.MAIL_FROM_NAME ?? 'Shine a Light',
  };
}

// ===== Resend =====

async function sendViaResend(params: SendParams): Promise<SendResult> {
  const from = fromAddress();

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${from.name} <${from.email}>`,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
      headers: params.headers,
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${body?.message ?? 'unknown error'}`);
  }
  return { id: body.id, provider: 'resend' };
}

// ===== Brevo =====

async function sendViaBrevo(params: SendParams): Promise<SendResult> {
  const from = fromAddress();

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY ?? '',
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { email: from.email, name: from.name },
      to: [{ email: params.to }],
      subject: params.subject,
      htmlContent: params.html,
      textContent: params.text,
      headers: params.headers,
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Brevo ${res.status}: ${body?.message ?? 'unknown error'}`);
  }
  return { id: body.messageId, provider: 'brevo' };
}

// ===== outbox（開発用）=====

/**
 * 送信せずに .mail-outbox/ へ HTML を書き出す。
 * ブラウザで開けば実際の見た目を確認できる。
 */
async function sendViaOutbox(params: SendParams): Promise<SendResult> {
  const dir = join(process.cwd(), '.mail-outbox');
  await mkdir(dir, { recursive: true });

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const safeTo = params.to.replace(/[^a-zA-Z0-9._-]/g, '_');

  await writeFile(join(dir, `${id}-${safeTo}.html`), params.html, 'utf8');
  await writeFile(
    join(dir, `${id}-${safeTo}.txt`),
    `To: ${params.to}\nSubject: ${params.subject}\n` +
      Object.entries(params.headers ?? {}).map(([k, v]) => `${k}: ${v}`).join('\n') +
      `\n\n${params.text}\n`,
    'utf8'
  );

  console.log(`[mailer:outbox] ${params.to} / ${params.subject} → .mail-outbox/${id}-${safeTo}.html`);
  return { id, provider: 'outbox' };
}

// ===== 公開API =====

export async function sendEmail(params: SendParams): Promise<SendResult> {
  switch (currentProvider()) {
    case 'resend': return sendViaResend(params);
    case 'brevo':  return sendViaBrevo(params);
    default:       return sendViaOutbox(params);
  }
}
