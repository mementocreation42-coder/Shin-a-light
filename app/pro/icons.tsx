/**
 * /pro ファミリー用の小さなインラインアイコン（stroke, currentColor）。
 * テキストラベルの視認性を上げるための装飾。aria-hidden で読み上げ対象外。
 */

type IconProps = { size?: number };

function Svg({ size = 15, children }: IconProps & { children: React.ReactNode }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ flexShrink: 0 }}
        >
            {children}
        </svg>
    );
}

export const IconCamera = (p: IconProps) => (
    <Svg {...p}>
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3.5" />
    </Svg>
);

export const IconGear = (p: IconProps) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h0a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55h0a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v0a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z" />
    </Svg>
);

export const IconYen = (p: IconProps) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 7.5 12 12m3.5-4.5L12 12m0 0v5M9.2 13h5.6M9.2 15.6h5.6" />
    </Svg>
);

export const IconCompass = (p: IconProps) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2 5-5 2 2-5 5-2z" />
    </Svg>
);

export const IconCalendar = (p: IconProps) => (
    <Svg {...p}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4m8-4v4M3 10h18" />
    </Svg>
);

export const IconUsers = (p: IconProps) => (
    <Svg {...p}>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
        <path d="M16 5.5a3.5 3.5 0 0 1 0 6.6M21.5 20a6.5 6.5 0 0 0-4.5-6" />
    </Svg>
);

export const IconHand = (p: IconProps) => (
    <Svg {...p}>
        <path d="M7 11V6a1.8 1.8 0 0 1 3.6 0v4M10.6 10V4.8a1.8 1.8 0 0 1 3.6 0V10m0 .2V6.8a1.8 1.8 0 0 1 3.6 0V13a7 7 0 0 1-7 7h-.4a7 7 0 0 1-5.9-3.2l-2-3.1a1.7 1.7 0 0 1 2.8-1.9L7 13.5" />
    </Svg>
);

export const IconZap = (p: IconProps) => (
    <Svg {...p}>
        <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2z" />
    </Svg>
);

export const IconBell = (p: IconProps) => (
    <Svg {...p}>
        <path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9z" />
        <path d="M10 20a2.2 2.2 0 0 0 4 0" />
    </Svg>
);

export const IconSparkles = (p: IconProps) => (
    <Svg {...p}>
        <path d="M12 4.5 13.6 9 18 10.5 13.6 12 12 16.5 10.4 12 6 10.5 10.4 9 12 4.5z" />
        <path d="M19 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2zM5 3l.6 1.7L7.3 5.3l-1.7.6L5 7.6 4.4 5.9 2.7 5.3l1.7-.6L5 3z" />
    </Svg>
);

export const IconPencil = (p: IconProps) => (
    <Svg {...p}>
        <path d="M17 3.5 20.5 7 8.5 19l-4.5 1 1-4.5L17 3.5z" />
    </Svg>
);

export const IconHammer = (p: IconProps) => (
    <Svg {...p}>
        <path d="m14 5 6 6-2.2 2.2-6-6L14 5z" />
        <path d="M11.8 7.2 4 15l3 3 7.8-7.8" />
        <path d="M13.5 3.5c1.5-1 3.5-1 5 .5l1.5 1.5" />
    </Svg>
);

export const IconRocket = (p: IconProps) => (
    <Svg {...p}>
        <path d="M5 15c-1.5 1.2-2 5-2 5s3.8-.5 5-2" />
        <path d="M9 15 4.5 10.5c1-2.5 2.5-4.8 4.5-6.5C12.5 1.5 17 1 21 1c0 4-.5 8.5-3 12-1.7 2-4 3.5-6.5 4.5L9 15z" />
        <circle cx="14.5" cy="7.5" r="1.8" />
    </Svg>
);
