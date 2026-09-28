/** RSS の目印（オレンジの四角に電波）。Journal のフィード /feed.xml へのリンクに使う */
export default function RssIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" focusable="false" style={{ flex: "none" }}>
            <rect width="16" height="16" rx="3.5" fill="#EE802F" />
            <circle cx="4.6" cy="11.4" r="1.6" fill="#fff" />
            <path d="M3 7.2a5.8 5.8 0 0 1 5.8 5.8M3 3.2a9.8 9.8 0 0 1 9.8 9.8" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
    );
}
