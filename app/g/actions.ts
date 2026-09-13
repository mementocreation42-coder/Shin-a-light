'use server';

import { redirect } from 'next/navigation';
import { loadGallery } from '@/lib/gallery';

export interface EnterState { error: string }

/** 総当たりの試行速度を落とすための一律ウェイト */
const FAIL_DELAY_MS = 1200;

/**
 * お渡しページの入口。渡したコード（= ギャラリーの token）を照合し、
 * 一致すれば /g/<token> へ送る。大文字小文字・空白・ハイフンは無視する。
 */
export async function enterGallery(_prev: EnterState, fd: FormData): Promise<EnterState> {
  const raw = (fd.get('code') as string) || '';
  const code = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
  const g = code ? await loadGallery(code) : null;
  if (!g) {
    await new Promise((r) => setTimeout(r, FAIL_DELAY_MS));
    return { error: 'コードが見つかりません。お渡しした文字列をもう一度ご確認ください。' };
  }
  redirect(`/g/${g.token}`);
}
