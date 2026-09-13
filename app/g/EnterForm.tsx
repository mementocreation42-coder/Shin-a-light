'use client';

import { useActionState } from 'react';
import { enterGallery, type EnterState } from './actions';

export default function EnterForm() {
  const [state, formAction, isPending] = useActionState(enterGallery, { error: '' } as EnterState);
  return (
    <form action={formAction} className="g-enter">
      <label htmlFor="g-code" className="g-enter-label">アクセスコード / Access code</label>
      <input
        id="g-code"
        name="code"
        type="text"
        required
        autoFocus
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        inputMode="text"
        placeholder="例: 8240309e0de99702"
        className="g-enter-input"
      />
      {state.error && <p className="g-enter-error">{state.error}</p>}
      <button type="submit" disabled={isPending} className="g-buy">
        {isPending ? '確認中…' : '写真を見る / Open gallery'}
      </button>
    </form>
  );
}
