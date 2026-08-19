import { NextRequest, NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db';
import { markBounced, markComplained, unsubscribeByEmail } from '@/lib/newsletter';
import { markOpened, markDeliveryFailed } from '@/lib/delivery';

/**
 * 送信サービスからの通知（webhook）。
 *
 * ここで受けるもの:
 *   不達（ハードバウンス） → 名簿から外す。二度と送らない
 *   迷惑メール報告          → 名簿から外す。再登録も受け付けない
 *   開封                    → 配信記録に残す（参考値）
 *
 * 不達・苦情の処理を怠ると、死んだアドレスに送り続けて送信元ドメインの
 * 評価が落ち、他の全員への到達率まで下がる。この1本は必ず動かしておくこと。
 *
 * 呼び出し元が本物かの確認:
 *   Resend … Svix 形式の署名ヘッダを RESEND_WEBHOOK_SECRET で検証する
 *   Brevo  … 署名の仕組みが無いので、URL に ?secret=… を付けて
 *            BREVO_WEBHOOK_SECRET と突き合わせる
 * どちらの秘密も未設定なら受け付けない。誰でも叩ける状態にすると、
 * 任意のアドレスを「不達」にして名簿から消せてしまう。
 *
 * 設定先:
 *   Resend  https://resend.com/webhooks  → https://<site>/api/newsletter/webhook
 *   Brevo   Transactional → Settings → Webhooks
 *           → https://<site>/api/newsletter/webhook?secret=<BREVO_WEBHOOK_SECRET>
 */

// 通知は同じものが再送されうる。処理はすべて冪等（何度来ても結果が同じ）に書く。

export async function POST(req: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'db not configured' }, { status: 503 });
  }

  const raw = await req.text();

  // どちらのサービスからかは、ヘッダの形で見分ける
  const isResend = Boolean(req.headers.get('svix-id'));

  if (isResend) {
    const secret = process.env.RESEND_WEBHOOK_SECRET;
    if (!secret) return NextResponse.json({ error: 'webhook secret not set' }, { status: 503 });

    const ok = await verifySvix(req.headers, raw, secret);
    if (!ok) return NextResponse.json({ error: 'bad signature' }, { status: 401 });

    return handleResend(raw);
  }

  const secret = process.env.BREVO_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'webhook secret not set' }, { status: 503 });

  const given = req.nextUrl.searchParams.get('secret') ?? '';
  if (!timingSafeEqualString(given, secret)) {
    return NextResponse.json({ error: 'bad secret' }, { status: 401 });
  }

  return handleBrevo(raw);
}

// ===== Resend =====
// https://resend.com/docs/dashboard/webhooks/event-types

interface ResendEvent {
  type: string;
  data?: {
    email_id?: string;
    to?: string[];
    bounce?: { type?: string; message?: string; subType?: string };
  };
}

async function handleResend(raw: string): Promise<NextResponse> {
  let event: ResendEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const messageId = event.data?.email_id ?? '';
  const recipients = event.data?.to ?? [];

  switch (event.type) {
    case 'email.bounced': {
      const bounce = event.data?.bounce;
      const reason = `resend:${bounce?.type ?? 'bounce'}${bounce?.subType ? `/${bounce.subType}` : ''}${bounce?.message ? ` ${bounce.message}` : ''}`;
      await markDeliveryFailed(messageId, reason);
      // 一時的な不達（受信箱が満杯など）では名簿から外さない
      if (bounce?.type === 'Permanent' || bounce?.type === undefined) {
        for (const to of recipients) await markBounced(to, reason);
      }
      break;
    }
    case 'email.complained':
      for (const to of recipients) await markComplained(to, 'resend:complaint');
      break;
    case 'email.opened':
      await markOpened(messageId);
      break;
    default:
      // delivered / sent / delivery_delayed などは記録しない
      break;
  }

  return NextResponse.json({ ok: true });
}

// ===== Brevo =====
// https://developers.brevo.com/docs/transactional-webhooks

interface BrevoEvent {
  event?: string;
  email?: string;
  'message-id'?: string;
  reason?: string;
}

async function handleBrevo(raw: string): Promise<NextResponse> {
  let payload: BrevoEvent | BrevoEvent[];
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const events = Array.isArray(payload) ? payload : [payload];

  for (const ev of events) {
    const email = ev.email ?? '';
    const messageId = ev['message-id'] ?? '';
    const reason = `brevo:${ev.event ?? 'unknown'}${ev.reason ? ` ${ev.reason}` : ''}`;

    switch (ev.event) {
      case 'hard_bounce':
      case 'invalid_email':
        await markDeliveryFailed(messageId, reason);
        if (email) await markBounced(email, reason);
        break;
      case 'blocked':
        // Brevo 側で送信自体を止められた。宛先が生きているかは分からないので
        // 記録だけ残し、名簿は触らない
        await markDeliveryFailed(messageId, reason);
        break;
      case 'spam':
        if (email) await markComplained(email, reason);
        break;
      case 'unsubscribed':
        // Brevo が自動で付ける解除リンクから解除された
        if (email) await unsubscribeByEmail(email);
        break;
      case 'opened':
      case 'unique_opened':
        await markOpened(messageId);
        break;
      default:
        // delivered / soft_bounce / deferred / click などは記録しない
        break;
    }
  }

  return NextResponse.json({ ok: true });
}

// ===== 署名の検証 =====

/**
 * Svix 形式（Resend が使っている）。
 *   署名対象 = "<svix-id>.<svix-timestamp>.<本文>"
 *   秘密鍵   = "whsec_" を外して base64 復号したもの
 *   ヘッダ   = "v1,<base64署名> v1,<別の鍵での署名> …"
 * ヘッダ内のどれか1つと一致すれば正当。
 */
async function verifySvix(headers: Headers, body: string, secret: string): Promise<boolean> {
  const id = headers.get('svix-id');
  const timestamp = headers.get('svix-timestamp');
  const signatures = headers.get('svix-signature');
  if (!id || !timestamp || !signatures) return false;

  // 古い通知の再生を防ぐ（前後5分）
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const keyBytes = base64ToBytes(secret.replace(/^whsec_/, ''));
  const key = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const mac = await crypto.subtle.sign(
    'HMAC', key, new TextEncoder().encode(`${id}.${timestamp}.${body}`)
  );
  const expected = bytesToBase64(new Uint8Array(mac));

  for (const part of signatures.split(' ')) {
    const [version, sig] = part.split(',');
    if (version === 'v1' && sig && timingSafeEqualString(sig, expected)) return true;
  }
  return false;
}

/** 長さを漏らさず文字列を比較する */
function timingSafeEqualString(a: string, b: string): boolean {
  const ab = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

function base64ToBytes(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const buf = new ArrayBuffer(bin.length);
  const out = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return buf;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
