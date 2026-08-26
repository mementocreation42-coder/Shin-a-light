import { palette, FONT, renderMarkdown, toPlainText, escapeHtml } from '@/lib/email/render';

/**
 * メールの外枠。
 *
 * メールHTMLは20年前の作法で書く必要がある。理由:
 * - Outlook(Windows)は Word のエンジンで描画するので flex も grid も効かない
 *   → table でレイアウトする
 * - <style> を落とすクライアントがある → style はタグに直接書く
 * - 幅は 600px が事実上の上限
 */

export interface LayoutParams {
  /** 受信箱の一覧で件名の隣に出る文。指定しないと本文の先頭が漏れ出る */
  preheader: string;
  /** 本文（変換済みHTML） */
  content: string;
  /** 解除リンク。配信メールには必須、確認メールには不要 */
  unsubUrl?: string;
}

function senderBlock(): string {
  const name = process.env.MAIL_FROM_NAME ?? 'Shine a Light';
  const address = process.env.MAIL_SENDER_ADDRESS ?? '';
  // 特定電子メール法により、送信者の名称と住所の表示が必要
  return address ? `${escapeHtml(name)}<br />${escapeHtml(address)}` : escapeHtml(name);
}

export function layout({ preheader, content, unsubUrl }: LayoutParams): string {
  const siteUrl = process.env.SITE_URL ?? 'https://www.shinealight.jp';

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="ja">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${escapeHtml(preheader)}</title>
<!--[if mso]>
<style type="text/css">body,table,td{font-family:'Yu Gothic',Meiryo,sans-serif !important;}</style>
<![endif]-->
</head>
<body style="margin:0;padding:0;background:${palette.pageBg};">

<!-- 受信箱のプレビュー文。本文としては見せない -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${palette.pageBg};">
<tr><td align="center" style="padding:24px 12px;">

  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${palette.cardBg};border:1px solid ${palette.border};border-radius:12px;">

    <tr><td style="padding:24px 32px;border-bottom:3px solid ${palette.accent};">
      <a href="${siteUrl}" style="font-family:${FONT};font-size:15px;font-weight:700;letter-spacing:0.08em;color:${palette.text};text-decoration:none;">SHINE A LIGHT</a>
    </td></tr>

    <tr><td style="padding:32px;font-family:${FONT};">
${content}
    </td></tr>

    <tr><td style="padding:24px 32px;border-top:1px solid ${palette.border};font-family:${FONT};font-size:12px;line-height:1.8;color:${palette.textMuted};">
      ${senderBlock()}
      <br /><br />
      ${
        unsubUrl
          ? `このメールは配信登録をいただいた方にお送りしています。<br />
             <a href="${unsubUrl}" style="color:${palette.textMuted};text-decoration:underline;">配信を解除する</a>`
          : ''
      }
    </td></tr>

  </table>

</td></tr>
</table>
</body>
</html>`;
}

// ===== 配信する号 =====

export interface IssueEmailParams {
  subject: string;
  preheader?: string;
  bodyMd: string;
  unsubUrl: string;
}

export function renderIssueEmail(p: IssueEmailParams): { html: string; text: string } {
  const preheader = p.preheader?.trim() || toPlainText(p.bodyMd).slice(0, 80);

  const content =
    `<h1 style="margin:0 0 24px;font-size:24px;line-height:1.5;font-weight:700;color:${palette.text};">${escapeHtml(p.subject)}</h1>\n` +
    renderMarkdown(p.bodyMd);

  const text =
    `${p.subject}\n${'='.repeat(20)}\n\n` +
    `${toPlainText(p.bodyMd)}\n\n` +
    `---\n配信解除: ${p.unsubUrl}\n`;

  return { html: layout({ preheader, content, unsubUrl: p.unsubUrl }), text };
}

// ===== 登録確認（ダブルオプトイン）=====

export function renderConfirmEmail(confirmUrl: string): { html: string; text: string } {
  const content = `
<h1 style="margin:0 0 20px;font-size:22px;line-height:1.5;font-weight:700;color:${palette.text};">登録の確認をお願いします</h1>
<p style="margin:0 0 24px;font-size:16px;line-height:1.85;color:${palette.text};">
Shine a Light のニュースレターにご登録ありがとうございます。<br />
下のボタンを押すと購読が完了します。
</p>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
<tr><td align="center" bgcolor="${palette.accent}" style="border-radius:6px;">
  <a href="${confirmUrl}" style="display:inline-block;padding:14px 32px;font-family:${FONT};font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;">登録を完了する</a>
</td></tr>
</table>

<p style="margin:0 0 8px;font-size:13px;line-height:1.8;color:${palette.textMuted};">
ボタンが押せない場合は、次のURLをブラウザに貼り付けてください。
</p>
<p style="margin:0 0 24px;font-size:13px;line-height:1.7;word-break:break-all;">
<a href="${confirmUrl}" style="color:${palette.accent};">${escapeHtml(confirmUrl)}</a>
</p>

<p style="margin:0;font-size:13px;line-height:1.8;color:${palette.textMuted};">
心当たりがない場合は、このメールを破棄してください。<br />
確認しない限り配信は始まりません。
</p>`;

  const text =
    `登録の確認をお願いします\n\n` +
    `Shine a Light のニュースレターにご登録ありがとうございます。\n` +
    `次のURLを開くと購読が完了します。\n\n${confirmUrl}\n\n` +
    `心当たりがない場合は破棄してください。確認しない限り配信は始まりません。\n`;

  // 確認メールはまだ購読が成立していないので解除リンクは出さない
  return { html: layout({ preheader: '登録の確認をお願いします', content }), text };
}

/** 登録完了直後に送るお礼＋プレゼント（selpico3）メール */
export function renderWelcomeEmail(p: { presetUrl: string; unsubUrl: string }): { html: string; text: string } {
  const content = `
<h1 style="margin:0 0 20px;font-size:22px;line-height:1.5;font-weight:700;color:${palette.text};">ご登録ありがとうございます</h1>
<p style="margin:0 0 24px;font-size:16px;line-height:1.85;color:${palette.text};">
Shine a Light のニュースレターへようこそ。<br />
映像・写真・AI・釣り・健康——暮らしを軽くするヒントを、不定期でお届けします。
</p>

<p style="margin:0 0 12px;font-size:16px;line-height:1.85;color:${palette.text};">
お礼に、SAL謹製の写真現像プリセット<strong>「selpico3」</strong>をお贈りします。<br />
下のボタンからダウンロードしてください。
</p>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">
<tr><td align="center" bgcolor="${palette.accent}" style="border-radius:6px;">
  <a href="${p.presetUrl}" style="display:inline-block;padding:14px 32px;font-family:${FONT};font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;">selpico3 をダウンロード</a>
</td></tr>
</table>

<p style="margin:0 0 8px;font-size:14px;line-height:1.8;color:${palette.text};"><strong>使い方（PC の Lightroom）</strong></p>
<p style="margin:0 0 16px;font-size:13px;line-height:1.8;color:${palette.textMuted};">
1. 上のボタンから selpico3.xmp を保存<br />
2. 編集（現像）画面で「プリセット」パネルを開き、「＋」→「プリセットを読み込み」<br />
3. 保存した selpico3.xmp を選ぶと、一覧に「selpico3」が追加されます<br />
4. 写真を開いて selpico3 をタップ。最後に露出だけ好みに合わせれば完成です
</p>

<p style="margin:0 0 8px;font-size:14px;line-height:1.8;color:${palette.text};"><strong>スマホの場合（Lightroom モバイル・無料版でOK）</strong></p>
<p style="margin:0 0 16px;font-size:13px;line-height:1.8;color:${palette.textMuted};">
写真を開く → 下部の「プリセット」→ 右上の「…」→「プリセットを読み込み」→ 保存した selpico3.xmp を選択。
</p>

<p style="margin:0 0 24px;font-size:13px;line-height:1.8;color:${palette.textMuted};">
ボタンからうまく保存できない場合は、次のURLをブラウザに貼り付けてください。<br />
<a href="${p.presetUrl}" style="color:${palette.accent};word-break:break-all;">${escapeHtml(p.presetUrl)}</a>
</p>

<p style="margin:0;font-size:14px;line-height:1.85;color:${palette.text};">
それでは、次の便でお会いしましょう。
</p>`;

  const text =
    `ご登録ありがとうございます\n\n` +
    `Shine a Light のニュースレターへようこそ。\n` +
    `映像・写真・AI・釣り・健康——暮らしを軽くするヒントを、不定期でお届けします。\n\n` +
    `お礼に、写真現像プリセット「selpico3」をお贈りします。\n` +
    `ダウンロード: ${p.presetUrl}\n\n` +
    `【使い方（PC の Lightroom）】\n` +
    `1. 上のURLから selpico3.xmp を保存\n` +
    `2. 編集（現像）画面で「プリセット」パネルを開き、「＋」→「プリセットを読み込み」\n` +
    `3. 保存した selpico3.xmp を選ぶと、一覧に「selpico3」が追加されます\n` +
    `4. 写真を開いて selpico3 をタップ。最後に露出だけ好みに合わせれば完成です\n\n` +
    `【スマホの場合（Lightroom モバイル・無料版でOK）】\n` +
    `写真を開く → 下部の「プリセット」→ 右上の「…」→「プリセットを読み込み」\n` +
    `→ 保存した selpico3.xmp を選択。\n\n` +
    `解除はこちら: ${p.unsubUrl}\n`;

  return { html: layout({ preheader: 'ようこそ。プレゼントの selpico3 をどうぞ', content, unsubUrl: p.unsubUrl }), text };
}
