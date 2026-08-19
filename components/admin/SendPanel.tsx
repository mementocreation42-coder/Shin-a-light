'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/admin/admin.module.css';
import nl from '@/app/admin/newsletter/newsletter.module.css';

export interface SendPanelProps {
  issueId: string;
  /** これから送る相手の数 */
  remaining: number;
  /** 送信サービス名。outbox のときは実際には送られない */
  provider: string;
  /** 1回の実行で送れる上限 */
  batchLimit: number;
  /** 件名・本文が埋まっているか。空のまま送らせない */
  ready: boolean;
  /** すでに配信済みの号か */
  done: boolean;
}

interface Result {
  sent: number;
  failed: number;
  remaining: number;
  error?: string;
}

export default function SendPanel({
  issueId,
  remaining,
  provider,
  batchLimit,
  ready,
  done,
}: SendPanelProps) {
  const router = useRouter();

  // 押したら取り消せないので、確認を1枚挟む
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');

  // 送信後は返ってきた残数を見る（サーバーの再取得を待たずに次の判断ができる）
  const left = result ? result.remaining : remaining;
  const thisRun = Math.min(left, batchLimit);

  async function send() {
    setSending(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/newsletter/issues/${issueId}/send`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '配信に失敗しました。');

      setResult(data);
      setConfirming(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : '配信に失敗しました。');
    } finally {
      setSending(false);
    }
  }

  if (done && left === 0) {
    return (
      <div className={nl.sendPanel}>
        <p className={nl.sendDone}>この号は配信し終えています。</p>
        {result && <ResultLine result={result} />}
      </div>
    );
  }

  return (
    <div className={nl.sendPanel}>
      {result && <ResultLine result={result} />}
      {error && <p className={nl.sendError}>{error}</p>}

      {provider === 'outbox' && (
        <p className={nl.sendWarn}>
          送信サービスが未設定です。このまま実行しても実際には送られず、
          <code>.mail-outbox/</code> にファイルとして書き出されます。
        </p>
      )}

      {!ready && (
        <p className={nl.sendWarn}>
          件名か本文が空です。編集画面で埋めてから配信してください。
        </p>
      )}

      {left === 0 ? (
        <p className={nl.sendDone}>いま送る相手はいません。</p>
      ) : !confirming ? (
        <>
          <p className={nl.sendLead}>
            <strong className={nl.sendCount}>{left.toLocaleString()}人</strong> に送ります。
            {left > batchLimit && (
              <>
                {' '}1回で送るのは {batchLimit.toLocaleString()}人まで。
                残りは続けてもう一度押してください。
              </>
            )}
          </p>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={!ready}
            className={styles.primaryBtn}
          >
            <span className={styles.btnText}>配信する</span>
          </button>
        </>
      ) : (
        <div className={nl.sendConfirm}>
          <p className={nl.sendConfirmText}>
            <strong>{thisRun.toLocaleString()}人</strong>に送信します。
            送ったメールは取り消せません。
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              onClick={send}
              disabled={sending}
              className={styles.primaryBtn}
            >
              <span className={styles.btnText}>{sending ? '送信中…' : 'はい、送ります'}</span>
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={sending}
              className={styles.ghostBtn}
            >
              やめる
            </button>
          </div>
          {sending && (
            <p className={nl.hint}>
              送信中はこの画面を閉じないでください。閉じた場合も、届いた分は記録に残ります。
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ResultLine({ result }: { result: Result }) {
  if (result.error) return <p className={nl.sendWarn}>{result.error}</p>;

  return (
    <p className={nl.sendResult}>
      {result.sent.toLocaleString()}人に送信しました。
      {result.failed > 0 && `${result.failed.toLocaleString()}人が失敗。`}
      {result.remaining > 0
        ? `残り${result.remaining.toLocaleString()}人です（もう一度押すと未達の人にだけ送ります）。`
        : 'この号は配信し終えました。'}
    </p>
  );
}
