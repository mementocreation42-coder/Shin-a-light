/**
 * SAL のマーク。3 つの円が重なる（声・考え・僕）。
 * 単色（currentColor）。置いた場所の文字色になる。
 */
export default function SalMark({ size = 22, className }: { size?: number; className?: string }) {
  const h = Math.round(size * (26 / 34));
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 34 26"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* 上に 1 つ、下に 2 つ。色は親の文字色（currentColor）に追従する単色 */}
      <g fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="17" cy="9" r="8" />
        <circle cx="12" cy="16" r="8" />
        <circle cx="22" cy="16" r="8" />
      </g>
    </svg>
  );
}
