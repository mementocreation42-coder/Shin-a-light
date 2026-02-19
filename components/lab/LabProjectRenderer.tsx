'use client';

import { LabRegistry } from './LabRegistry';

interface Props {
    componentKey: string;
}

export default function LabProjectRenderer({ componentKey }: Props) {
    const Component = LabRegistry[componentKey];

    if (!Component) {
        return (
            <div className="p-4 border border-red-500 bg-red-500/10 text-red-500 rounded">
                <p>System component not found for key: <strong>{componentKey}</strong></p>
                <p className="text-sm mt-2 opacity-75">
                    Available keys: {Object.keys(LabRegistry).join(', ')}
                </p>
            </div>
        );
    }

    return <Component />;
}
