import { getAppSetting } from '@/lib/appSettings';
import { sendEmail } from '@/lib/email/mailer';
import { getSql } from '@/lib/db';

/**
 * ニュースレターの登録が成立したとき（確認メールのリンクが押されたとき）に、
 * 運営者へ「新しい登録者」の通知メールを送る。
 *
 * 宛先は NEWSLETTER_NOTIFY_TO → CONTACT_TO → DB（app_settings の contact_to）の順で探す。
 * お問い合わせ通知と同じ宛先に届く。どれも無ければ送らない（ログだけ残す）。
 *
 * フォームを送っただけ（確認メール未クリック）の段階では通知しない。
 * タイプミスや迷惑登録まで届いてしまうため。
 */

async function notifyTo(): Promise<string | null> {
  return (
    process.env.NEWSLETTER_NOTIFY_TO ??
    process.env.CONTACT_TO ??
    (await getAppSetting('contact_to'))
  );
}

/** 登録元のパスを、人が読める名前にする */
function sourceLabel(source: string | null): string {
  if (!source) return '不明';
  if (source === 'import') return '一括取り込み';
  if (source === 'manual') return '管理画面で手動追加';
  if (source === '/newsletter') return 'ニュースレターのページ（/newsletter）';
  return `${source} のページ`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export async function notifyNewSubscriber(p: { email: string; source: string | null }): Promise<void> {
  const to = await notifyTo();
  if (!to) {
    console.warn('[Newsletter] 通知先が未設定のため、新規登録の通知を送りません');
    return;
  }

  // 現在の配信対象の人数（通知の件名に入れる）。取れなくても通知は送る
  let active: number | null = null;
  try {
    const rows = await getSql()<{ n: number }>`select count(*)::int as n from subscribers where status = 'active'`;
    active = rows[0]?.n ?? null;
  } catch {
    /* 人数なしで送る */
  }

  const origin = process.env.SITE_URL ?? 'https://www.shinealight.jp';
  const when = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', dateStyle: 'medium', timeStyle: 'short' });
  const from = sourceLabel(p.source);
  const total = active !== null ? `（配信対象 ${active} 人）` : '';
  const adminUrl = `${origin}/admin/newsletter#subscribers`;

  await sendEmail({
    to,
    subject: `【SAL LETTER】新しい登録がありました${total}`,
    text: [
      'SAL LETTER に新しい登録がありました。',
      '',
      `メールアドレス: ${p.email}`,
      `登録元: ${from}`,
      `日時: ${when}`,
      active !== null ? `配信対象: ${active} 人` : '',
      '',
      `登録者の一覧: ${adminUrl}`,
    ].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n'),
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Hiragino Sans',sans-serif;font-size:14px;line-height:1.8;color:#1a1a1a">
<p style="margin:0 0 12px">SAL LETTER に新しい登録がありました。</p>
<table style="border-collapse:collapse;margin:0 0 16px">
<tr><td style="padding:4px 16px 4px 0;color:#777">メールアドレス</td><td style="padding:4px 0"><strong>${escapeHtml(p.email)}</strong></td></tr>
<tr><td style="padding:4px 16px 4px 0;color:#777">登録元</td><td style="padding:4px 0">${escapeHtml(from)}</td></tr>
<tr><td style="padding:4px 16px 4px 0;color:#777">日時</td><td style="padding:4px 0">${escapeHtml(when)}</td></tr>
${active !== null ? `<tr><td style="padding:4px 16px 4px 0;color:#777">配信対象</td><td style="padding:4px 0">${active} 人</td></tr>` : ''}
</table>
<p style="margin:0"><a href="${adminUrl}" style="color:#e4582b">登録者の一覧を開く →</a></p>
</div>`,
  });
}
