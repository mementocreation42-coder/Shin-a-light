'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/admin/admin.module.css';
import nl from '@/app/admin/newsletter/newsletter.module.css';

/**
 * 手動での登録。
 *
 * 既存の名簿からの移行や、イベントで直接もらったアドレスを入れるための口。
 * 貼り付けたものからアドレスを拾うので、1行1件でもカンマ区切りでも通る。
 *
 * 普段は畳んでおく。名簿を見に来ただけのときに、
 * 書き込める入力欄が開いている必要はない。
 */
export default function SubscriberAdd({
  disabled = false,
}: {
  /** DB 未接続。押せないが、どこから登録するのかは見えている状態にする */
  disabled?: boolean;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit() {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/admin/newsletter/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '登録に失敗しました。');

      const parts = [`${data.added.toLocaleString()}件を登録しました`];
      if (data.skipped > 0) parts.push(`${data.skipped.toLocaleString()}件は登録済みのため変更していません`);
      if (data.invalid?.length > 0) parts.push(`${data.invalid.length}行は読み取れませんでした`);

      setMessage(`${parts.join('／')}。`);
      setText('');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : '登録に失敗しました。');
    } finally {
      setSaving(false);
    }
  }

  if (disabled) {
    return (
      <div className={nl.addRow}>
        <button type="button" disabled className={styles.ghostBtn}>
          ＋ 手動で登録
        </button>
        <span className={nl.hint} style={{ margin: 0 }}>
          データベースを繋ぐと、ここから既存の名簿を貼り付けて登録できます。
        </span>
      </div>
    );
  }

  if (!open) {
    return (
      <div className={nl.addRow}>
        <button type="button" onClick={() => setOpen(true)} className={styles.ghostBtn}>
          ＋ 手動で登録
        </button>
        {message && <span className={nl.addResult}>{message}</span>}
      </div>
    );
  }

  return (
    <div className={nl.addPanel}>
      <label htmlFor="sub-add" className={nl.label}>手動で登録</label>
      <textarea
        id="sub-add"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={saving}
        className={`${nl.textarea} ${nl.addTextarea}`}
        placeholder={'taro@example.com\nhanako@example.jp\n\nスプレッドシートからそのまま貼り付けても構いません。'}
      />
      <p className={nl.hint}>
        貼り付けた中からメールアドレスを拾います。1行1件でも、カンマ区切りでも、
        「名前 &lt;mail@example.com&gt;」の形でも読めます。
        すでに名簿にあるアドレスは触りません（解除済みの人が復活することはありません）。
      </p>
      <p className={nl.addWarn}>
        ここから入れた人には確認メールを送らず、すぐ配信対象になります。
        すでに同意をもらっている相手だけを入れてください。
      </p>

      {message && <p className={nl.addResult}>{message}</p>}
      {error && <p className={nl.addError}>{error}</p>}

      <div className={styles.actions}>
        <button
          type="button"
          onClick={submit}
          disabled={saving || !text.trim()}
          className={styles.primaryBtn}
        >
          <span className={styles.btnText}>{saving ? '登録中…' : '登録する'}</span>
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(''); }}
          disabled={saving}
          className={styles.ghostBtn}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
