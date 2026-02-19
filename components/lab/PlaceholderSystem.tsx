'use client';

import { useState } from 'react';

export default function PlaceholderSystem() {
    const [count, setCount] = useState(0);

    return (
        <div style={{
            padding: '32px',
            border: '1px solid #333',
            backgroundColor: '#1a1a1a',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto'
        }}>
            <h3 style={{ marginBottom: '16px', color: '#fff' }}>Interactive Placeholder</h3>
            <p style={{ marginBottom: '24px', color: '#ccc' }}>Current Count: <strong>{count}</strong></p>
            <button
                onClick={() => setCount(count + 1)}
                style={{
                    padding: '12px 24px',
                    backgroundColor: '#ff764d',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}
            >
                Increment
            </button>
        </div>
    );
}
