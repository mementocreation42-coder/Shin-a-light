'use client';
import { useState } from 'react';

export default function BuyOriginal({ token, photoId, label, className }: { token: string; photoId?: string; label: string; className?: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  async function go() {
    setBusy(true); setMsg('');
    try {
      const r = await fetch('/api/gallery/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, photoId }) });
      const d = await r.json();
      if (!r.ok) { setMsg(d.error || 'Something went wrong'); return; }
      window.location.href = d.url;
    } catch { setMsg('Connection error'); } finally { setBusy(false); }
  }
  return (
    <span className={className}>
      <button type="button" onClick={go} disabled={busy} className="g-buy">{busy ? '…' : label}</button>
      {msg && <span className="g-msg">{msg}</span>}
    </span>
  );
}
