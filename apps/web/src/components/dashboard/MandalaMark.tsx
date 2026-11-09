/**
 * Study Buddy mark — a navy tile holding an open book with a blaze spark.
 *
 * File and export keep the old name (`MandalaMark`) so the six call sites and the
 * `size` / `spinCls` / `className` props stay untouched; the artwork is the Buddy
 * design system's. `spinCls` is kept for API compatibility: it now drives the
 * spark's slow pulse (set to '' to hold it still). Reduced motion is honoured
 * globally in buddy-theme.css.
 */

interface MandalaMarkProps {
  size?: number
  /** Set to '' to freeze the spark (e.g. when honoring an explicit motion=off). */
  spinCls?: string
  className?: string
}

export default function MandalaMark({ size = 36, spinCls = 'spin', className }: MandalaMarkProps) {
  const gid = `sbmark-${size}`
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={`${gid}-tile`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="55%" stopColor="#0F1F5C" />
          <stop offset="100%" stopColor="#0A0F24" />
        </linearGradient>
        <linearGradient id={`${gid}-blaze`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF8A3D" />
          <stop offset="55%" stopColor="#FF4D00" />
          <stop offset="100%" stopColor="#D93A00" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="30" fill={`url(#${gid}-tile)`} />
      {/* open book: two pages meeting at the spine */}
      <path d="M60 44 C48 36 33 36 22 40 V84 C33 80 48 80 60 88 Z" fill="#F2F4F8" />
      <path d="M60 44 C72 36 87 36 98 40 V84 C87 80 72 80 60 88 Z" fill="#DCE1EA" />
      <path d="M60 44 V88" stroke="#0A0F24" strokeOpacity=".28" strokeWidth="2" />
      {/* page lines */}
      <path d="M31 52 C38 50 44 50 51 53 M31 61 C38 59 44 59 51 62 M31 70 C38 68 44 68 51 71" stroke="#5F6B8C" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      {/* the spark: blaze = action */}
      <g className={spinCls}>
        <path
          d="M86 14 C87.4 22.6 90 25.2 98.6 26.6 C90 28 87.4 30.6 86 39.2 C84.6 30.6 82 28 73.4 26.6 C82 25.2 84.6 22.6 86 14 Z"
          fill={`url(#${gid}-blaze)`}
        />
      </g>
    </svg>
  )
}
