/* ─────────────────────────────────────────────────────────
   Munin Systems mark — single identity, multi-scale.
   Geometric M-monogram (rune-form) inside a circle, with a
   vertical pin piercing the circle and extending below it.
   ───────────────────────────────────────────────────────── */

interface Props {
  size?: number;          // pixel size of the mark (excluding wordmark)
  withWordmark?: boolean; // render "MUNIN SYSTEMS" alongside
  variant?: 'plain' | 'instrument';  // 'instrument' adds heraldic tick marks for large display
  color?: string;
  className?: string;
}

export default function MuninMark({
  size = 28,
  withWordmark = false,
  variant = 'plain',
  color = 'currentColor',
  className,
}: Props) {
  const W = 56;
  const H = 70;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: withWordmark ? 12 : 0,
        color,
      }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={size}
        height={(size * H) / W}
        aria-hidden
        style={{ flexShrink: 0 }}
      >
        {variant === 'instrument' && (
          <>
            {/* Outer guide circle — very faint */}
            <circle cx="28" cy="28" r="26" fill="none" stroke={color} strokeWidth="0.5" opacity="0.18" />
            {/* Tick marks at 12 positions around perimeter */}
            <g stroke={color} strokeWidth="0.6" opacity="0.45">
              {Array.from({ length: 60 }).map((_, i) => {
                const a = (i / 60) * Math.PI * 2;
                const major = i % 5 === 0;
                const r1 = 24.5;
                const r2 = major ? 26.2 : 25.4;
                const x1 = (28 + Math.cos(a) * r1).toFixed(3);
                const y1 = (28 + Math.sin(a) * r1).toFixed(3);
                const x2 = (28 + Math.cos(a) * r2).toFixed(3);
                const y2 = (28 + Math.sin(a) * r2).toFixed(3);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
              })}
            </g>
          </>
        )}

        {/* Primary circle */}
        <circle
          cx="28" cy="28" r="22"
          fill="none"
          stroke={color}
          strokeWidth={variant === 'instrument' ? 3 : 3.5}
        />

        {/* M-monogram: outer legs angle inward, inner V dips below the feet
            forming the deep central valley that becomes the pin */}
        <path
          d="M 18 38 L 14 10 L 28 44 L 42 10 L 38 38"
          fill="none"
          stroke={color}
          strokeWidth={variant === 'instrument' ? 3 : 3.5}
          strokeLinejoin="miter"
          strokeLinecap="butt"
        />

        {/* Vertical pin — from centre meeting point down through bottom and beyond */}
        <line
          x1="28" y1="44" x2="28" y2="64"
          stroke={color}
          strokeWidth={variant === 'instrument' ? 3 : 3.5}
        />
      </svg>

      {withWordmark && (
        <span
          style={{
            fontWeight: 600,
            fontSize: Math.round(size * 0.52),
            letterSpacing: '-0.005em',
            color,
            whiteSpace: 'nowrap',
          }}
        >
          Munin Systems
        </span>
      )}
    </span>
  );
}
