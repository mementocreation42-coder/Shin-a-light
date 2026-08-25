'use client';

import { useActionState, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { login, verifyCode, type LoginState } from './actions';

const inputStyle: React.CSSProperties = {
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
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  color: '#a0a0a0',
  marginBottom: '8px',
};

function submitStyle(isPending: boolean): React.CSSProperties {
  return {
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
  };
}

const INITIAL: LoginState = { error: '', stage: 'password' };

/** 第1段階：パスワード */
function PasswordStep({ from, onAdvance }: { from: string; onAdvance: (s: LoginState) => void }) {
  const [state, formAction, isPending] = useActionState(
    async (prev: LoginState, fd: FormData) => {
      const next = await login(prev, fd);
      if (next.stage === 'totp') onAdvance(next);
      return next;
    },
    INITIAL
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="from" value={from} />
      {/* パスワードマネージャーが資格情報を識別するためのユーザー名欄。
          視覚的には隠すが DOM には残す（display:none だと無視されるため） */}
      <input
        name="username"
        type="text"
        autoComplete="username"
        defaultValue="admin"
        aria-hidden="true"
        tabIndex={-1}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      />
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>パスワード</label>
        <input name="password" type="password" autoComplete="current-password" required autoFocus placeholder="••••••••" style={inputStyle} />
      </div>

      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        fontSize: '13px',
        color: '#a0a0a0',
        cursor: 'pointer',
        userSelect: 'none',
      }}>
        <input
          name="remember"
          type="checkbox"
          defaultChecked
          style={{ width: 16, height: 16, accentColor: '#ff764d', cursor: 'pointer' }}
        />
        ログインしたままにする（30日）
      </label>

      {state.error && <p style={{ color: '#e74c3c', fontSize: '13px', marginBottom: '16px' }}>{state.error}</p>}

      <button type="submit" disabled={isPending} style={submitStyle(isPending)}>
        {isPending ? '確認中...' : '次へ'}
      </button>
    </form>
  );
}

/** 第2段階：認証アプリの6桁コード */
function TotpStep({ from, onExpire }: { from: string; onExpire: () => void }) {
  const [state, formAction, isPending] = useActionState(
    async (prev: LoginState, fd: FormData) => {
      const next = await verifyCode(prev, fd);
      // 猶予切れでパスワード段階に差し戻された場合
      if (next.stage === 'password') onExpire();
      return next;
    },
    { error: '', stage: 'totp' } as LoginState
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="from" value={from} />
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>認証コード</label>
        <input
          name="code"
          type="text"
          required
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="000000"
          style={{ ...inputStyle, letterSpacing: '8px', textAlign: 'center', fontSize: '20px' }}
        />
        <p style={{ fontSize: '11px', color: '#777', marginTop: '8px', lineHeight: 1.6 }}>
          認証アプリに表示されている6桁の数字を入力してください
        </p>
      </div>

      {state.error && <p style={{ color: '#e74c3c', fontSize: '13px', marginBottom: '16px' }}>{state.error}</p>}

      <button type="submit" disabled={isPending} style={submitStyle(isPending)}>
        {isPending ? '確認中...' : 'ログイン'}
      </button>
    </form>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/admin';
  const [stage, setStage] = useState<'password' | 'totp'>('password');

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1e1e1e',
      fontFamily: "var(--font-sans-jp), 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', sans-serif",
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
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#ff764d', letterSpacing: '2px' }}>SAL</div>
          <div style={{ fontSize: '11px', color: '#666', letterSpacing: '3px', marginTop: '4px' }}>
            {stage === 'totp' ? '2段階認証' : 'ADMIN'}
          </div>
        </div>

        {stage === 'totp'
          ? <TotpStep from={from} onExpire={() => setStage('password')} />
          : <PasswordStep from={from} onAdvance={() => setStage('totp')} />}
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
