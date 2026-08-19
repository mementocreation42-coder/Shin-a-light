import { NextRequest, NextResponse } from 'next/server';
import { renderIssueEmail, renderConfirmEmail } from '@/lib/email/templates';

/**
 * メールの見た目を確認するための開発用ルート。
 *
 *   /api/newsletter/preview          … 配信メール
 *   /api/newsletter/preview?type=confirm … 登録確認メール
 *
 * 本番では 404 を返す。誰でも叩けるプレビューを残さないため。
 */

const SAMPLE = `今月も見ていただきありがとうございます。**制作の裏側**と、最近よかった道具の話を。

## 撮影の現場から

先週は徳島の山あいで3日間の撮影でした。朝もやが出るのは日の出から30分だけで、そこを外すと1日待つことになります。

- 三脚は結局いちばん軽いものに戻った
- NDフィルターは可変式をやめて固定式に
- 予備バッテリーは想定の倍が要る

> 機材を減らすほど、撮れる画は増える。

### 使っているツール

現像は [Lightroom](https://lightroom.adobe.com) のままですが、書き出しの設定を見直しました。詳しくは \`export-preset\` の記事に書いています。

---

来月は水中撮影の話をする予定です。`;

export async function GET(req: NextRequest) {
    if (process.env.NODE_ENV === 'production') {
        return new NextResponse('Not found', { status: 404 });
    }

    const type = req.nextUrl.searchParams.get('type');
    const format = req.nextUrl.searchParams.get('format');

    const mail =
        type === 'confirm'
            ? renderConfirmEmail('http://localhost:3000/newsletter/confirm?token=sample-token')
            : renderIssueEmail({
                  subject: '朝もやは30分しか出ない',
                  preheader: '撮影の裏側と、最近よかった道具の話',
                  bodyMd: SAMPLE,
                  unsubUrl: 'http://localhost:3000/newsletter/unsubscribe?token=sample-token',
              });

    if (format === 'text') {
        return new NextResponse(mail.text, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    }

    return new NextResponse(mail.html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}
