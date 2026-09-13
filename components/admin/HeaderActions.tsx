'use client';

import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { HEADER_ACTIONS_ID } from './AdminHeader';

const noop = () => () => {};

/**
 * ページ固有のボタンを共通ヘッダーの右側に差し込む。
 * 使い方: <HeaderActions><Link …>新規投稿</Link></HeaderActions>
 * ヘッダーは layout が描くので、ページ側からはポータルで届ける。
 * サーバー描画時は何も出さず、クライアントで受け口が見つかってから差し込む。
 */
export default function HeaderActions({ children }: { children: React.ReactNode }) {
  const isClient = useSyncExternalStore(noop, () => true, () => false);
  const target = isClient ? document.getElementById(HEADER_ACTIONS_ID) : null;
  return target ? createPortal(children, target) : null;
}
