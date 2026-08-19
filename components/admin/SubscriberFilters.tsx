'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import styles from '@/app/admin/admin.module.css';

// 名簿はニュースレター管理トップに埋め込んである。絞り込みのたびに
// 画面の上（号の一覧）へ戻らないよう、遷移先に錨を付ける。
const BASE = '/admin/newsletter';
const ANCHOR = '#subscribers';

/** 登録者の絞り込み。投稿一覧の PostFilters と同じ操作感に揃えている */
export default function SubscriberFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get('q') ?? '';
  const currentStatus = searchParams.get('status') ?? '';

  const [search, setSearch] = useState(currentSearch);

  // URL 側（戻る/進む・リセット）の変化を入力欄に反映する
  useEffect(() => { setSearch(currentSearch); }, [currentSearch]);

  function apply(next: { q?: string; status?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    // 絞り込みを変えたら1ページ目に戻す
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `${BASE}?${qs}${ANCHOR}` : `${BASE}${ANCHOR}`);
  }

  // 入力中は打鍵ごとに遷移させず、止まってからまとめて反映する
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => apply({ q: value }), 400);
  }
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const hasFilters = Boolean(currentSearch || currentStatus);

  return (
    <div className={styles.filters}>
      <input
        type="search"
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        onKeyDown={(e) => {
          // 日本語入力の確定 Enter で検索が走らないようにする
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (debounceRef.current) clearTimeout(debounceRef.current);
            apply({ q: search });
          }
        }}
        placeholder="メールアドレスで検索"
        className={styles.searchInput}
        aria-label="登録者をメールアドレスで検索"
      />

      <select
        value={currentStatus}
        onChange={(e) => apply({ status: e.target.value })}
        className={styles.filterSelect}
        aria-label="状態で絞り込み"
      >
        <option value="">すべての状態</option>
        <option value="active">配信対象</option>
        <option value="pending">確認待ち</option>
        <option value="unsubscribed">解除済み</option>
        <option value="bounced">不達</option>
        <option value="complained">迷惑メール報告</option>
      </select>

      {hasFilters && (
        <button type="button" onClick={() => router.push(`${BASE}${ANCHOR}`)} className={styles.resetBtn}>
          リセット
        </button>
      )}
    </div>
  );
}
