'use client';

import { useState } from 'react';
import styles from '@/app/admin/admin.module.css';

interface EyecatchResult {
  total: number;
  ok: number;
  skip: number;
  error: number;
}

export default function AdminToolbar() {
  const [eyecatchStatus, setEyecatchStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [eyecatchResult, setEyecatchResult] = useState<EyecatchResult | null>(null);
  const [cacheStatus, setCacheStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');

  async function handleFixEyecatch() {
    if (eyecatchStatus === 'running') return;
    setEyecatchStatus('running');
    setEyecatchResult(null);
    try {
      const res = await fetch('/api/admin/fix-eyecatch', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setEyecatchResult(data);
      setEyecatchStatus('done');
    } catch {
      setEyecatchStatus('error');
    }
  }

  async function handleClearCache() {
    if (cacheStatus === 'running') return;
    setCacheStatus('running');
    try {
      const res = await fetch('/api/admin/revalidate', { method: 'POST' });
      if (!res.ok) throw new Error();
      setCacheStatus('done');
      setTimeout(() => setCacheStatus('idle'), 3000);
    } catch {
      setCacheStatus('error');
      setTimeout(() => setCacheStatus('idle'), 3000);
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
      <button
        type="button"
        onClick={handleFixEyecatch}
        disabled={eyecatchStatus === 'running'}
        className={styles.ghostBtn}
      >
        {eyecatchStatus === 'running' ? '取得中...' : 'アイキャッチ一括修正'}
      </button>

      <button
        type="button"
        onClick={handleClearCache}
        disabled={cacheStatus === 'running'}
        className={styles.ghostBtn}
      >
        {cacheStatus === 'running' ? 'クリア中...' : cacheStatus === 'done' ? '✓ クリア完了' : 'キャッシュクリア'}
      </button>

      {eyecatchStatus === 'done' && eyecatchResult && (
        <span style={{ fontSize: '11px', color: '#666' }}>
          設定: {eyecatchResult.ok}件 / スキップ: {eyecatchResult.skip}件
          {eyecatchResult.error > 0 && ` / エラー: ${eyecatchResult.error}件`}
        </span>
      )}
      {eyecatchStatus === 'error' && (
        <span style={{ fontSize: '11px', color: '#e74c3c' }}>エラーが発生しました</span>
      )}
      {cacheStatus === 'error' && (
        <span style={{ fontSize: '11px', color: '#e74c3c' }}>キャッシュクリア失敗</span>
      )}
    </div>
  );
}
