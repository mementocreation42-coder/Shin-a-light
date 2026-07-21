'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from '@/app/admin/admin.module.css';

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

  return (
    <div className={styles.actions}>
      <Link href={`/admin/posts/${postId}/edit`} className={styles.actionBtn}>
        編集
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
      >
        {deleting ? '削除中...' : '削除'}
      </button>
    </div>
  );
}
