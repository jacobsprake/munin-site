/* ─────────────────────────────────────────────────────────
   Munin Systems mark — single identity, multi-scale.

   Construction (viewBox 0 0 100 130):
   - Circle: centred at (50, 50), radius 42, heavy stroke
   - M-letterform: two vertical outer legs + inner V meeting
     at centre-baseline, all feet at y=76
   - Vertical pin: from M centre-baseline (50, 76) down past
     the circle bottom (y=92) to y=120
   ───────────────────────────────────────────────────────── */

interface Props {
  size?: number;
  withWordmark?: boolean;
  variant?: 'plain' | 'instrument';
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
  const W = 100;
  const H = 130;
  const stroke = variant === 'instrument' ? 5 : 6;

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
        style={{ flexShrink: 0, overflow: 'visible' }}
      >
        {variant === 'instrument' && (
          <g stroke={color} strokeWidth="0.7" opacity="0.45" fill="none">
            {Array.from({ length: 60 }).map((_, i) => {
              const a = (i / 60) * Math.PI * 2;
              const major = i % 5 === 0;
              const r1 = 47;
              const r2 = major ? 50 : 48.5;
              const x1 = (50 + Math.cos(a) * r1).toFixed(3);
              const y1 = (50 + Math.sin(a) * r1).toFixed(3);
              const x2 = (50 + Math.cos(a) * r2).toFixed(3);
              const y2 = (50 + Math.sin(a) * r2).toFixed(3);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}
          </g>
        )}

        {/* Primary circle */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth={stroke}
        />

        {/* M-letterform: vertical outer legs + inner V */}
        <path
          d="M 25 76 L 25 18 L 50 76 L 75 18 L 75 76"
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinejoin="miter"
          strokeLinecap="butt"
          strokeMiterlimit="6"
        />

        {/* Vertical pin extending past circle bottom */}
        <line
          x1="50"
          y1="76"
          x2="50"
          y2="120"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="butt"
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
