import type { Metadata } from 'next';
import NewsletterShell from '@/components/admin/NewsletterShell';
import nl from '@/app/admin/newsletter/newsletter.module.css';

export const metadata: Metadata = {
    title: '自動送信メール | Admin',
    robots: { index: false, follow: false },
};

/** 登録フローで自動送信されるメールの一覧とプレビュー */
const TEMPLATES = [
    {
        key: 'confirm',
        name: '確認メール',
        subject: '【Shine a Light】登録の確認をお願いします',
        when: 'フォームでメールアドレスが登録された直後',
        note: 'このメール内のリンクを踏むまで配信は始まらない（ダブルオプトイン）',
    },
    {
        key: 'welcome',
        name: 'ウェルカムメール（お礼＋selpico3）',
        subject: '【Shine a Light】ようこそ。プレゼントの selpico3 をどうぞ',
        when: '確認リンクを踏んで登録が完了した直後',
        note: 'プリセットのダウンロードボタンと解除リンク付き',
    },
];

export default function SystemMailPage() {
    return (
        <NewsletterShell breadcrumb="自動送信メール">
            <p className={nl.fileModeNotice}>
                登録フローで自動的に送られるメールの実物プレビューです。
                文言の変更はコード（lib/email/templates.ts）で行います。
            </p>

            {TEMPLATES.map((t) => (
                <section key={t.key} style={{ marginBottom: 48 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{t.name}</h2>
                    <p style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 2 }}>件名：{t.subject}</p>
                    <p style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 2 }}>送信タイミング：{t.when}</p>
                    <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>{t.note}</p>
                    <iframe
                        src={`/api/admin/newsletter/preview?template=${t.key}`}
                        title={t.name}
                        style={{
                            width: '100%',
                            maxWidth: 680,
                            height: 640,
                            border: '1px solid #3a3a3a',
                            borderRadius: 8,
                            background: '#fff',
                        }}
                    />
                </section>
            ))}
        </NewsletterShell>
    );
}
