'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import styles from '@/app/admin/admin.module.css';

interface Category { id: number; name: string; }

export default function PostFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get('q') ?? '';
  const currentStatus = searchParams.get('status') ?? '';
  const currentCategory = searchParams.get('cat') ?? '';

  const [search, setSearch] = useState(currentSearch);

  // URL 側（戻る/進む・リセット）の変化を入力欄に反映する
  useEffect(() => { setSearch(currentSearch); }, [currentSearch]);

  // 絞り込みを変えたら1ページ目に戻す
  function apply(next: { q?: string; status?: string; cat?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `/admin?${qs}` : '/admin');
  }

  // 入力中は打鍵ごとに遷移させず、止まってからまとめて反映する
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => apply({ q: value }), 400);
  }
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const hasFilters = Boolean(currentSearch || currentStatus || currentCategory);

  return (
    <div className={styles.filters}>
      <input
        type="search"
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (debounceRef.current) clearTimeout(debounceRef.current);
            apply({ q: search });
          }
        }}
        placeholder="タイトルで検索"
        className={styles.searchInput}
        aria-label="投稿をタイトルで検索"
      />

      <select
        value={currentStatus}
        onChange={(e) => apply({ status: e.target.value })}
        className={styles.filterSelect}
        aria-label="公開状態で絞り込み"
      >
        <option value="">すべての状態</option>
        <option value="publish">公開のみ</option>
        <option value="draft">下書きのみ</option>
      </select>

      <select
        value={currentCategory}
        onChange={(e) => apply({ cat: e.target.value })}
        className={styles.filterSelect}
        aria-label="カテゴリで絞り込み"
      >
        <option value="">すべてのカテゴリ</option>
        {categories.map((cat) => (
          <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className={styles.resetBtn}
        >
          リセット
        </button>
      )}
    </div>
  );
}
