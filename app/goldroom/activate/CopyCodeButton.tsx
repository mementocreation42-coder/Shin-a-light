'use client';

import { useState } from 'react';

export default function CopyCodeButton({ code }: { code: string }) {
    const [done, setDone] = useState(false);
    return (
        <button
            type="button"
            className="email-submit-btn"
            onClick={async () => {
                await navigator.clipboard.writeText(code);
                setDone(true);
            }}
        >
            {done ? 'コピーしました' : 'コードをコピー'}
        </button>
    );
}
