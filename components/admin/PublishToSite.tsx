'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Gallery } from '@/lib/gallery';
import styles from '@/app/admin/admin.module.css';

/**
 * お渡しギャラリーの写真を選んで、サイトの作例（/photos の MEMENTO）に公開する。
 * 公開済みの写真はチェックできない（二重投稿を防ぐ）。
 */
export default function PublishToSite({ gallery }: { gallery: Gallery }) {
  const router = useRouter();
  const published = new Set(gallery.published ?? []);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  async function publish() {
    if (selected.size === 0) return;
    if (!confirm(`${selected.size} 枚をサイトの作例（/photos の MEMENTO）に公開します。相手の了承は取れていますか？`)) return;
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/galleries/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: gallery.token, photoIds: [...selected] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.error || '公開に失敗しました');
        return;
      }
      const failed = Array.isArray(data.errors) ? data.errors.length : 0;
      setMsg(failed ? `${data.added.length} 枚を公開。${failed} 枚は失敗しました` : `${data.added.length} 枚を公開しました`);
      setSelected(new Set());
      router.refresh();
    } catch {
      setMsg('通信に失敗しました');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #3a3a3a' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {gallery.photos.map((p) => {
          const done = published.has(p.id);
          const on = selected.has(p.id);
          return (
            <button
              key={p.id}
              type="button"
              disabled={done || busy}
              onClick={() => toggle(p.id)}
              title={done ? '公開済み' : `#${p.id} を選ぶ`}
              style={{
                position: 'relative',
                width: 72,
                height: 54,
                padding: 0,
                border: `2px solid ${on ? '#ff764d' : 'transparent'}`,
                borderRadius: 6,
                overflow: 'hidden',
                background: '#222',
                cursor: done ? 'default' : 'pointer',
                opacity: done ? 0.45 : 1,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.preview.jpg} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <span style={{ position: 'absolute', left: 4, bottom: 3, fontSize: 10, color: '#fff', textShadow: '0 0 3px #000' }}>
                {done ? '公開済' : `#${p.id}`}
              </span>
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <button type="button" onClick={publish} disabled={busy || selected.size === 0} className={styles.actionBtn}>
          {busy ? '公開中…' : `サイトに公開（${selected.size} 枚）`}
        </button>
        <span style={{ fontSize: 11, color: '#888' }}>
          {msg || (published.size > 0 ? `公開済み ${published.size} 枚` : '選んだ写真が /photos の MEMENTO に作例として載る')}
        </span>
      </div>
    </div>
  );
}
