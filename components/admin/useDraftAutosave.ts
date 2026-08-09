'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// localStorage に置くスナップショットの形。
// 画像は WP へアップロード済みのもの（url と id を持つ）だけを残す。
// アップロード前の blob URL はリロードで失効するため復元しても表示できない。
export interface DraftSnapshot {
  title: string;
  date: string;
  categoryIds: number[];
  body: string;
  products: unknown[];
  images: { url: string; id: number }[];
  eyecatch: { url: string; id: number } | null;
  savedAt: number;
}

const PREFIX = 'sal:draft:';
const SAVE_DEBOUNCE_MS = 1500;
// これより古い下書きは復元を促さない（別セッションの残骸を蒸し返さないため）
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

export function draftKey(postId?: string) {
  return `${PREFIX}${postId ?? 'new'}`;
}

function readDraft(key: string): DraftSnapshot | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftSnapshot;
    if (!parsed || typeof parsed.savedAt !== 'number') return null;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      window.localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * エディタの入力を定期的に localStorage へ退避し、
 * 未保存のままタブを閉じようとしたら警告する。
 *
 * @param postId    編集中の投稿ID。新規作成時は undefined
 * @param snapshot  現在の編集内容
 * @param dirty     初期状態から変化しているか。false の間は保存も警告もしない
 * @param enabled   サーバー保存中／完了後などに無効化するためのフラグ
 */
export function useDraftAutosave({
  postId,
  snapshot,
  dirty,
  enabled = true,
}: {
  postId?: string;
  snapshot: Omit<DraftSnapshot, 'savedAt'>;
  dirty: boolean;
  enabled?: boolean;
}) {
  const key = draftKey(postId);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [restorable, setRestorable] = useState<DraftSnapshot | null>(null);

  // マウント時に一度だけ、前回の未保存下書きがあるか確認する
  useEffect(() => {
    const existing = readDraft(key);
    if (existing) setRestorable(existing);
    // key は postId 由来で、このコンポーネントの生存中は変わらない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 入力が落ち着いたタイミングで書き出す
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  useEffect(() => {
    if (!enabled || !dirty) return;
    const timer = setTimeout(() => {
      try {
        const payload: DraftSnapshot = { ...snapshotRef.current, savedAt: Date.now() };
        window.localStorage.setItem(key, JSON.stringify(payload));
        setSavedAt(payload.savedAt);
      } catch {
        // 容量超過などは保存を諦める。編集自体は妨げない
      }
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [key, dirty, enabled, snapshot]);

  // 未保存のまま離脱しようとしたら確認ダイアログを出す
  useEffect(() => {
    if (!enabled || !dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty, enabled]);

  const clearDraft = useCallback(() => {
    try { window.localStorage.removeItem(key); } catch { /* noop */ }
    setSavedAt(null);
    setRestorable(null);
  }, [key]);

  const dismissRestore = useCallback(() => {
    setRestorable(null);
  }, []);

  return { savedAt, restorable, clearDraft, dismissRestore };
}
