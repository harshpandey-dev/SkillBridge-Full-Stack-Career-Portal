import { useId } from 'react'

interface SkillBridgeLogoProps {
  variant?: 'icon' | 'wordmark' | 'full'
  iconSize?: number
  className?: string
  forceTheme?: 'light' | 'dark'
}

function SBMonogram({
  size,
  gradId,
  forceTheme,
}: {
  size: number
  gradId: string
  forceTheme?: 'light' | 'dark'
}) {
  // Container fill colors:
  // Light:     #F1F5F9  – light slate, visible on white surfaces
  // Dark auto: #0F1E30  – dark navy (softer than pure #0D1B2A, less contrast-heavy on sidebar)
  // Force dark: #1A2940 – slightly lighter navy for sidebar polish; still clearly dark
  const rectStyle: React.CSSProperties | undefined =
    forceTheme === 'dark'
      ? { fill: '#1A2940' }  // softer dark bg: less harsh against #163A5F sidebar
      : forceTheme === 'light'
      ? { fill: '#F1F5F9' }
      : undefined

  const rectClassName =
    forceTheme == null ? 'fill-[#F1F5F9] dark:fill-[#0F1E30]' : ''

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        {/*
          Horizontal gradient: blue #2563EB → cyan #06B6D4
          userSpaceOnUse so it spans both S and B letterforms.
        */}
        <linearGradient
          id={gradId}
          gradientUnits="userSpaceOnUse"
          x1="5"
          y1="20"
          x2="34"
          y2="20"
        >
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      {/* Container — rounded square */}
      <rect
        width="40"
        height="40"
        rx="8"
        className={rectClassName}
        style={rectStyle}
      />

      {/*
        S letterform — bold rounded open-stroke S.
        strokeWidth 3.8 (up from 3.5) improves legibility at small sizes (16–32px)
        without affecting appearance at larger sizes.
      */}
      <path
        d="M17 10C17 7.5 15.2 7 13 7L9 7C6.8 7 5 8.5 5 10.5C5 12.5 6.8 14 9 14.5L13 15.5C15.5 16 17 17.5 17 19.5C17 21.5 15.5 23 13 23L9 23C6.8 23 5 21.5 5 19.5"
        stroke={`url(#${gradId})`}
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/*
        B letterform — vertical stem + upper bump + lower bump.
        Same strokeWidth 3.8 for consistent visual weight with S.
      */}
      <path
        d="M20 7L20 33M20 7L26 7C29.5 7 32 10 32 13C32 16 29.5 19 26 19L20 19M20 19L27 19C31 19 34 22 34 26C34 30 31 33 27 33L20 33"
        stroke={`url(#${gradId})`}
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function SkillBridgeLogo({
  variant = 'wordmark',
  iconSize,
  className = '',
  forceTheme,
}: SkillBridgeLogoProps) {
  const uid = useId()
  const gradId = `sbg${uid.replace(/:/g, '_')}`

  // Default icon sizes per variant.
  // icon     : 32px — favicon / compact spots
  // wordmark : 28px — navbar / sidebar (minimum 28px for readable SB at this size)
  // full     : 68px — loading screen (~20% larger than previous 56px)
  const resolvedIconSize =
    iconSize ?? (variant === 'full' ? 68 : variant === 'icon' ? 32 : 28)

  // ── Text color classes ──────────────────────────────────────────────────────
  const skillClass =
    forceTheme === 'dark'
      ? 'text-white'
      : forceTheme === 'light'
      ? 'text-[#163A5F]'
      : 'text-[#163A5F] dark:text-white'

  const bridgeClass =
    forceTheme === 'dark'
      ? 'text-[#06B6D4]'
      : forceTheme === 'light'
      ? 'text-[#2563EB]'
      : 'text-[#2563EB] dark:text-[#06B6D4]'

  const taglineClass =
    forceTheme === 'dark'
      ? 'text-[rgba(255,255,255,0.45)]'
      : forceTheme === 'light'
      ? 'text-[#667085]'
      : 'text-[#667085] dark:text-[rgba(255,255,255,0.45)]'

  const icon = (
    <SBMonogram
      size={resolvedIconSize}
      gradId={gradId}
      forceTheme={forceTheme}
    />
  )

  // ── icon variant ────────────────────────────────────────────────────────────
  if (variant === 'icon') {
    return (
      <span
        className={`inline-flex leading-none ${className}`}
        aria-label="SkillBridge"
      >
        {icon}
      </span>
    )
  }

  // ── full variant ────────────────────────────────────────────────────────────
  // Loading screen: monogram (68px default) + larger wordmark + tagline.
  // gap-4 gives more breathing room between icon and text block at this size.
  if (variant === 'full') {
    return (
      <div
        className={`flex flex-col items-center gap-4 ${className}`}
        aria-label="SkillBridge — Your Skills. Your Future."
      >
        {icon}
        <div className="flex flex-col items-center gap-1.5">
          {/* Wordmark: text-3xl (up from text-2xl) scales with the larger icon */}
          <span className="font-bold text-3xl tracking-tight leading-tight select-none">
            <span className={skillClass}>Skill</span>
            <span className={bridgeClass}>Bridge</span>
          </span>
          {/* Tagline: text-[11px] (up from 10px) — slightly more readable */}
          <span
            className={`text-[11px] font-semibold tracking-[0.18em] uppercase select-none leading-none ${taglineClass}`}
          >
            Your Skills. Your Future.
          </span>
        </div>
      </div>
    )
  }

  // ── wordmark variant ────────────────────────────────────────────────────────
  // gap-2.5 (up from gap-2): +2px breathing room between icon and text.
  // Keeps vertical alignment centered, does not affect navbar height.
  return (
    <div
      className={`inline-flex items-center gap-2.5 ${className}`}
      aria-label="SkillBridge"
    >
      {icon}
      <span className="font-bold text-base tracking-tight leading-none select-none">
        <span className={skillClass}>Skill</span>
        <span className={bridgeClass}>Bridge</span>
      </span>
    </div>
  )
}
