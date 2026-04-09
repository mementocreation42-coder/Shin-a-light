'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { login } from './actions';
import { Suspense } from 'react';

function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/admin';
  const [state, formAction, isPending] = useActionState(login, { error: '' });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1e1e1e',
      fontFamily: 'var(--font-mono), monospace',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '360px',
        padding: '40px',
        background: '#2a2a2a',
        border: '1px solid #3a3a3a',
        borderRadius: '12px',
      }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#ff764d', letterSpacing: '2px' }}>
            SAL
          </div>
          <div style={{ fontSize: '11px', color: '#666', letterSpacing: '3px', marginTop: '4px' }}>
            ADMIN
          </div>
        </div>

        <form action={formAction}>
          <input type="hidden" name="from" value={from} />

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#a0a0a0', marginBottom: '8px' }}>
              パスワード
            </label>
            <input
              name="password"
              type="password"
              required
              autoFocus
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px',
                background: '#1e1e1e',
                border: '1px solid #3a3a3a',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {state.error && (
            <p style={{ color: '#e74c3c', fontSize: '13px', marginBottom: '16px' }}>{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            style={{
              width: '100%',
              padding: '12px',
              background: '#ff764d',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: isPending ? 'not-allowed' : 'pointer',
              opacity: isPending ? 0.7 : 1,
              fontFamily: 'inherit',
              letterSpacing: '1px',
            }}
          >
            {isPending ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
