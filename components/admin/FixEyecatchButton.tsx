'use client';

import { useState } from 'react';

interface Result {
  total: number;
  ok: number;
  skip: number;
  error: number;
}

export default function FixEyecatchButton() {
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<Result | null>(null);

  async function handleClick() {
    if (status === 'running') return;
    setStatus('running');
    setResult(null);
    try {
      const res = await fetch('/api/admin/fix-eyecatch', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResult(data);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  const btnStyle: React.CSSProperties = {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #3a3a3a',
    color: status === 'running' ? '#666' : '#a0a0a0',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: status === 'running' ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <button type="button" onClick={handleClick} disabled={status === 'running'} style={btnStyle}>
        {status === 'running' ? '取得中...' : 'アイキャッチ一括修正'}
      </button>
      {status === 'done' && result && (
        <span style={{ fontSize: '11px', color: '#666' }}>
          完了 — 設定: {result.ok}件 / スキップ: {result.skip}件
          {result.error > 0 && ` / エラー: ${result.error}件`}
        </span>
      )}
      {status === 'error' && (
        <span style={{ fontSize: '11px', color: '#e74c3c' }}>エラーが発生しました</span>
      )}
    </div>
  );
}
