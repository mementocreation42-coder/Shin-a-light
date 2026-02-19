'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const PlaceholderSystem = dynamic(() => import('./PlaceholderSystem'), {
    loading: () => <p>Loading System...</p>,
    ssr: false
});

export const LabRegistry: Record<string, React.ComponentType> = {
    placeholder: PlaceholderSystem,
};
