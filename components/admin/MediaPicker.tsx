'use client';

import { useState, useEffect, useCallback } from 'react';

interface MediaItem {
  id: number;
  source_url: string;
  alt_text: string;
  title: { rendered: string };
  media_details?: { width?: number; height?: number };
}

interface Props {
  onSelect: (item: MediaItem) => void;
  onClose: () => void;
}

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 2019 }, (_, i) => currentYear - i);
const MONTHS = [
  { value: '1', label: '1月' }, { value: '2', label: '2月' }, { value: '3', label: '3月' },
  { value: '4', label: '4月' }, { value: '5', label: '5月' }, { value: '6', label: '6月' },
  { value: '7', label: '7月' }, { value: '8', label: '8月' }, { value: '9', label: '9月' },
  { value: '10', label: '10月' }, { value: '11', label: '11月' }, { value: '12', label: '12月' },
];

const sel: React.CSSProperties = {
  background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '6px',
  padding: '6px 8px', color: '#fff', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer',
};

export default function MediaPicker({ onSelect, onClose }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchMedia = useCallback(async (p: number, q: string, y: string, m: string) => {
    setLoading(true);
    setSelected(new Set());
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (q) params.set('search', q);
      if (y) params.set('year', y);
      if (m) params.set('month', m);
      const res = await fetch(`/api/admin/media?${params}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setTotalPages(data.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMedia(1, '', '', ''); }, [fetchMedia]);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchMedia(1, search, year, month); }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function applyFilter(y: string, m: string) {
    setPage(1);
    fetchMedia(1, search, y, m);
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(items.map((i) => i.id)));
  }

  async function handleDelete() {
    if (selected.size === 0) return;
    if (!confirm(`選択した ${selected.size} 枚の画像を削除しますか？この操作は取り消せません。`)) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selected] }),
      });
      const data = await res.json();
      if (data.failed > 0) {
        const detail = data.errors?.join('\n') ?? '';
        alert(`${data.deleted} 枚削除、${data.failed} 枚失敗\n\n${detail}`);
      }
      setSelected(new Set());
      fetchMedia(page, search, year, month);
    } finally {
      setDeleting(false);
    }
  }

  function handleItemClick(item: MediaItem) {
    if (deleteMode) {
      toggleSelect(item.id);
    } else {
      onSelect(item);
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#1e1e1e', borderRadius: '12px', width: '1000px', maxWidth: '96vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', border: '1px solid #3a3a3a' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #3a3a3a', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '13px', fontWeight: 700, color: '#ff764d', letterSpacing: '1px', flexShrink: 0 }}>MEDIA LIBRARY</span>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
            <select value={year} onChange={(e) => { setYear(e.target.value); setMonth(''); applyFilter(e.target.value, ''); }} style={sel}>
              <option value="">全年</option>
              {YEARS.map((y) => <option key={y} value={String(y)}>{y}年</option>)}
            </select>

            <select value={month} onChange={(e) => { setMonth(e.target.value); applyFilter(year, e.target.value); }} disabled={!year} style={{ ...sel, opacity: year ? 1 : 0.4 }}>
              <option value="">全月</option>
              {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>

            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="検索..."
              style={{ background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '6px', padding: '6px 12px', color: '#fff', fontSize: '12px', fontFamily: 'inherit', width: '130px' }}
            />

            {/* 削除モード切り替え */}
            <button
              onClick={() => { setDeleteMode((v) => !v); setSelected(new Set()); }}
              style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', border: '1px solid', background: deleteMode ? 'rgba(231,76,60,0.15)' : 'transparent', borderColor: deleteMode ? '#e74c3c' : '#3a3a3a', color: deleteMode ? '#e74c3c' : '#666' }}
            >
              {deleteMode ? '選択モード中' : '削除選択'}
            </button>

            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
          </div>
        </div>

        {/* Delete action bar */}
        {deleteMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 20px', background: 'rgba(231,76,60,0.08)', borderBottom: '1px solid #3a3a3a' }}>
            <span style={{ fontSize: '12px', color: '#e74c3c', fontFamily: 'var(--font-mono), monospace' }}>
              {selected.size > 0 ? `${selected.size} 枚選択中` : '削除する画像をクリックして選択'}
            </span>
            <button onClick={selectAll} style={{ ...sel, fontSize: '11px', padding: '4px 10px', color: '#a0a0a0' }}>全選択</button>
            <button onClick={() => setSelected(new Set())} style={{ ...sel, fontSize: '11px', padding: '4px 10px', color: '#a0a0a0' }}>選択解除</button>
            <button
              onClick={handleDelete}
              disabled={selected.size === 0 || deleting}
              style={{ marginLeft: 'auto', padding: '6px 16px', background: selected.size > 0 ? '#e74c3c' : '#3a3a3a', border: 'none', borderRadius: '6px', color: selected.size > 0 ? '#fff' : '#555', fontSize: '12px', fontFamily: 'inherit', fontWeight: 700, cursor: selected.size > 0 ? 'pointer' : 'default', opacity: deleting ? 0.6 : 1 }}
            >
              {deleting ? '削除中...' : `${selected.size} 枚を削除`}
            </button>
          </div>
        )}

        {/* Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#666', fontSize: '13px' }}>読み込み中...</div>
          ) : items.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#666', fontSize: '13px' }}>画像が見つかりません</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '6px' }}>
              {items.map((item) => {
                const isSelected = selected.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    style={{
                      aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', position: 'relative',
                      border: `2px solid ${isSelected ? '#e74c3c' : 'transparent'}`,
                      background: '#2a2a2a', transition: 'border-color 0.1s',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = deleteMode ? '#e74c3c' : '#ff764d'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'transparent'; }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.source_url} alt={item.alt_text || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isSelected ? 0.6 : 1 }} loading="lazy" />
                    {isSelected && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(231,76,60,0.25)' }}>
                        <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 700 }}>✓</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '10px 20px', borderTop: '1px solid #3a3a3a' }}>
          <button onClick={() => { const p = page - 1; setPage(p); fetchMedia(p, search, year, month); }} disabled={page <= 1}
            style={{ padding: '5px 14px', background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '6px', color: page <= 1 ? '#444' : '#a0a0a0', cursor: page <= 1 ? 'default' : 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>← 前</button>
          <span style={{ fontSize: '12px', color: '#666' }}>{page} / {totalPages}</span>
          <button onClick={() => { const p = page + 1; setPage(p); fetchMedia(p, search, year, month); }} disabled={page >= totalPages}
            style={{ padding: '5px 14px', background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '6px', color: page >= totalPages ? '#444' : '#a0a0a0', cursor: page >= totalPages ? 'default' : 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>次 →</button>
        </div>
      </div>
    </div>
  );
}
