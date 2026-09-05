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
  const rectStyle: React.CSSProperties | undefined =
    forceTheme === 'dark'
      ? { fill: '#0D1B2A' }
      : forceTheme === 'light'
      ? { fill: '#F1F5F9' }
      : undefined

  const rectClassName =
    forceTheme == null ? 'fill-[#F1F5F9] dark:fill-[#0D1B2A]' : ''

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
      <rect
        width="40"
        height="40"
        rx="8"
        className={rectClassName}
        style={rectStyle}
      />
      <path
        d="M17 10C17 7.5 15.2 7 13 7L9 7C6.8 7 5 8.5 5 10.5C5 12.5 6.8 14 9 14.5L13 15.5C15.5 16 17 17.5 17 19.5C17 21.5 15.5 23 13 23L9 23C6.8 23 5 21.5 5 19.5"
        stroke={`url(#${gradId})`}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 7L20 33M20 7L26 7C29.5 7 32 10 32 13C32 16 29.5 19 26 19L20 19M20 19L27 19C31 19 34 22 34 26C34 30 31 33 27 33L20 33"
        stroke={`url(#${gradId})`}
        strokeWidth="3.5"
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

  const resolvedIconSize =
    iconSize ?? (variant === 'full' ? 56 : variant === 'icon' ? 32 : 28)

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

  if (variant === 'full') {
    return (
      <div
        className={`flex flex-col items-center gap-3 ${className}`}
        aria-label="SkillBridge — Your Skills. Your Future."
      >
        {icon}
        <div className="flex flex-col items-center gap-1">
          <span className="font-bold text-2xl tracking-tight leading-tight select-none">
            <span className={skillClass}>Skill</span>
            <span className={bridgeClass}>Bridge</span>
          </span>
          <span
            className={`text-[10px] font-semibold tracking-[0.18em] uppercase select-none leading-none ${taglineClass}`}
          >
            Your Skills. Your Future.
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
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
