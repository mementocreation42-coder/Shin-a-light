'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PostActions({ postId }: { postId: number }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm('この投稿を削除しますか？この操作は取り消せません。')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || '削除に失敗しました');
      }
    } finally {
      setDeleting(false);
    }
  }

  const btnBase: React.CSSProperties = {
    fontSize: '12px',
    padding: '5px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 600,
    letterSpacing: '0.5px',
    border: '1px solid',
    transition: 'opacity 0.15s',
  };

  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
      <Link
        href={`/admin/posts/${postId}/edit`}
        style={{ ...btnBase, background: '#2a2a2a', borderColor: '#3a3a3a', color: '#a0a0a0', textDecoration: 'none' }}
      >
        編集
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        style={{ ...btnBase, background: 'transparent', borderColor: '#555', color: '#888', opacity: deleting ? 0.5 : 1 }}
      >
        {deleting ? '削除中...' : '削除'}
      </button>
    </div>
  );
}
