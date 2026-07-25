import { useId } from 'react'

type Props = {
  size?: number
  className?: string
}

/** Shared Swayam Nirman mark — two people, equal footing, connected with trust. */
export function BrandLogo({ size = 34, className }: Props) {
  const uid = useId().replace(/:/g, '')
  const bgId = `sn-bg-${uid}`
  const accentId = `sn-accent-${uid}`

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={bgId} x1="10" y1="6" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22a784" />
          <stop offset="0.55" stopColor="#0f7a62" />
          <stop offset="1" stopColor="#0a4f42" />
        </linearGradient>
        <linearGradient id={accentId} x1="24" y1="30" x2="44" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffd166" />
          <stop offset="1" stopColor="#e07828" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${bgId})`} />
      <path
        d="M12 49h40"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.45"
      />
      <circle cx="21" cy="23" r="5.2" fill="#ffffff" />
      <path
        d="M12 47c2.2-11 5.5-15.5 9-15.5s6.8 4.5 9 15.5"
        fill="#ffffff"
        opacity="0.95"
      />
      <circle cx="43" cy="23" r="5.2" fill="#ffffff" />
      <path
        d="M34 47c2.2-11 5.5-15.5 9-15.5s6.8 4.5 9 15.5"
        fill="#ffffff"
        opacity="0.95"
      />
      <path
        d="M25 35.5h14"
        stroke={`url(#${accentId})`}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M29 35.5l3-5.5 3 5.5"
        stroke="#ffffff"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="14" r="3" fill={`url(#${accentId})`} opacity="0.95" />
    </svg>
  )
}
