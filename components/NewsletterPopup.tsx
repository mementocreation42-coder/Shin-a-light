'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import NewsletterForm from '@/components/NewsletterForm';

/**
 * サイトを開いたときに出すニュースレター（SAL LETTER）登録のポップアップ。
 *
 * 邪魔にならないためのルール:
 * - 開いて 3 秒後に出す（ページの表示を待つ）
 * - 閉じたら 14 日は出さない。登録した人には二度と出さない（localStorage）
 * - 同じタブで一度出したら、ページを移っても出さない（sessionStorage）
 * - 管理画面・ログイン・ニュースレターのページ・お渡しギャラリー・法人向け・全画面ページでは出さない
 */

const DELAY_MS = 3000;
const SNOOZE_DAYS = 14;
const KEY_SNOOZE = 'sal-nl-popup-snooze-until';
const KEY_DONE = 'sal-nl-popup-done';
const KEY_SHOWN = 'sal-nl-popup-shown';

const EXCLUDED = ['/admin', '/login', '/newsletter', '/g', '/pro', '/chronicle', '/store/success'];

function isExcluded(pathname: string): boolean {
    return EXCLUDED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** ストレージが使えない環境（プライベートモードなど）でも落ちないように */
function read(storage: 'local' | 'session', key: string): string | null {
    try {
        return (storage === 'local' ? localStorage : sessionStorage).getItem(key);
    } catch {
        return null;
    }
}
function write(storage: 'local' | 'session', key: string, value: string) {
    try {
        (storage === 'local' ? localStorage : sessionStorage).setItem(key, value);
    } catch {
        /* 保存できなくても表示は続ける */
    }
}

function shouldShow(): boolean {
    if (read('local', KEY_DONE)) return false;
    if (read('session', KEY_SHOWN)) return false;
    const until = Number(read('local', KEY_SNOOZE) ?? 0);
    return !until || Date.now() > until;
}

export default function NewsletterPopup() {
    const pathname = usePathname() ?? '';
    const [open, setOpen] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);
    const excluded = isExcluded(pathname);

    // 開いてから少し待って出す。対象外のページに移ったら予約を取り消す
    useEffect(() => {
        if (excluded || open) return;
        const timer = window.setTimeout(() => {
            if (!shouldShow()) return;
            write('session', KEY_SHOWN, '1');
            setOpen(true);
        }, DELAY_MS);
        return () => window.clearTimeout(timer);
    }, [excluded, open]);

    const close = useCallback(() => {
        setOpen(false);
        // 登録済みなら二度と出さない。閉じただけなら 14 日休む
        if (!subscribed) write('local', KEY_SNOOZE, String(Date.now() + SNOOZE_DAYS * 86_400_000));
    }, [subscribed]);

    // Esc で閉じる。開いたら入力欄にフォーカス
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', onKey);
        dialogRef.current?.querySelector<HTMLInputElement>('input[type="email"]')?.focus({ preventScroll: true });
        return () => window.removeEventListener('keydown', onKey);
    }, [open, close]);

    if (!open || excluded) return null;

    return (
        <div className="nlp-backdrop" onClick={close}>
            <div
                ref={dialogRef}
                className="nlp-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="nlp-title"
                onClick={(e) => e.stopPropagation()}
            >
                <button type="button" className="nlp-close" onClick={close} aria-label="閉じる">
                    ×
                </button>
                <p className="nlp-eyebrow">Newsletter</p>
                <h2 id="nlp-title" className="nlp-title">SAL LETTER</h2>
                <p className="nlp-lede">
                    映像・写真・AI・釣り・健康 —— 暮らしを軽くするヒントを、不定期で届けています。
                </p>
                <p className="nlp-gift">🎁 登録すると、写真現像プリセット「selpico3」をプレゼント。</p>
                <NewsletterForm
                    onSuccess={() => {
                        setSubscribed(true);
                        write('local', KEY_DONE, '1');
                    }}
                />
                {!subscribed && (
                    <button type="button" className="nlp-later" onClick={close}>
                        今はしない
                    </button>
                )}
            </div>
        </div>
    );
}
