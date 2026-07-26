import { memo } from 'react'

type Props = {
  skillId: string
  size?: number
}

/** Large, clear pictorial icons — easy for all ages to recognize */
export const SkillGlyph = memo(function SkillGlyph({ skillId, size = 56 }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 64 64',
    fill: 'none',
    'aria-hidden': true as const,
  }

  switch (skillId) {
    case 'mr-servant':
      return (
        <svg {...common}>
          <ellipse cx="32" cy="50" rx="18" ry="4" fill="#E8C547" opacity="0.55" />
          <circle cx="32" cy="17" r="7" fill="#fff" />
          <path d="M20 48c2-14 6-20 12-20s10 6 12 20" fill="#fff" />
          <path
            d="M26 34h12M26 38l6 6 6-6"
            stroke="#E8C547"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="14" y="38" width="9" height="11" rx="2" fill="#E8C547" />
          <path d="M18.5 38v-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'priest':
      return (
        <svg {...common}>
          <ellipse cx="32" cy="48" rx="14" ry="4" fill="#E8C547" opacity="0.6" />
          <path d="M26 44c0-8 2.5-14 6-14s6 6 6 14" fill="#fff" />
          <path d="M28 30h8l-2 14H30l-2-14z" fill="#E8C547" />
          <ellipse cx="32" cy="28" rx="6" ry="3" fill="#fff" />
          <path d="M32 22v6" stroke="#E8C547" strokeWidth="2" strokeLinecap="round" />
          <circle cx="32" cy="20" r="2" fill="#E8C547" />
        </svg>
      )
    case 'astrology':
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="20" stroke="#fff" strokeWidth="2.5" />
          <circle cx="32" cy="32" r="12" stroke="#E8C547" strokeWidth="2" />
          <path d="M32 12v40M12 32h40M18 18l28 28M46 18L18 46" stroke="#fff" strokeWidth="1.5" opacity="0.7" />
          <path d="M14 16l2 4 4-1-1 4 4 1-3 3 1 4-4-1-1 4-2-4-4 1 1-4-4-1 3-3-4-1 1-4 4 1z" fill="#E8C547" />
          <path d="M48 10l1.5 3 3-.5-.5 3 3 .5-2.5 2 .5 3-3-.5-.5 3-1.5-3-3 .5.5-3-3-.5 2.5-2-3-.5.5-3 3 .5z" fill="#fff" />
        </svg>
      )
    case 'nurse':
      return (
        <svg {...common}>
          <circle cx="32" cy="16" r="7" fill="#fff" />
          <path d="M20 52c2-14 6-20 12-20s10 6 12 20" fill="#fff" />
          <rect x="28" y="30" width="8" height="14" rx="1" fill="#fff" opacity="0.95" />
          <rect x="30" y="34" width="4" height="10" rx="0.5" fill="#C94A4A" />
          <rect x="27" y="37" width="10" height="4" rx="0.5" fill="#C94A4A" />
        </svg>
      )
    case 'attendar':
      return (
        <svg {...common}>
          <circle cx="24" cy="20" r="6" fill="#fff" />
          <path d="M14 52c2-12 6-18 10-18s8 6 10 18" fill="#fff" />
          <circle cx="44" cy="24" r="5" fill="#fff" opacity="0.9" />
          <path d="M36 52c1-10 4-14 8-14s7 4 8 14" fill="#fff" opacity="0.85" />
          <path d="M28 36h12" stroke="#E8C547" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'hospital-work':
      return (
        <svg {...common}>
          <rect x="14" y="20" width="36" height="32" rx="2" fill="#fff" />
          <rect x="14" y="20" width="36" height="8" fill="#E8C547" />
          <rect x="28" y="32" width="8" height="20" fill="#C94A4A" />
          <rect x="22" y="38" width="20" height="8" fill="#C94A4A" />
          <path d="M22 14h20v8H22z" fill="#fff" />
        </svg>
      )
    case 'teacher':
      return (
        <svg {...common}>
          <rect x="10" y="16" width="44" height="28" rx="2" fill="#fff" />
          <text x="32" y="34" textAnchor="middle" fill="#1B6B5A" fontSize="14" fontWeight="bold" fontFamily="sans-serif">abc</text>
          <rect x="28" y="44" width="8" height="8" fill="#E8C547" />
        </svg>
      )
    case 'spoken-english':
      return (
        <svg {...common}>
          <path d="M14 20h28a4 4 0 014 4v10a4 4 0 01-4 4H28l-8 8v-8h-6a4 4 0 01-4-4V24a4 4 0 014-4z" fill="#fff" />
          <text x="32" y="36" textAnchor="middle" fill="#1B6B5A" fontSize="12" fontWeight="bold" fontFamily="sans-serif">En</text>
        </svg>
      )
    case 'one-day-assistance':
      return (
        <svg {...common}>
          <rect x="12" y="14" width="40" height="34" rx="3" fill="#fff" />
          <rect x="12" y="14" width="40" height="10" fill="#E8C547" />
          <path d="M22 10v8M42 10v8" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="36" r="10" stroke="#1B6B5A" strokeWidth="2.5" />
          <path d="M32 30v8M28 34h8" stroke="#1B6B5A" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    case 'labor':
      return (
        <svg {...common}>
          <path d="M28 12h8l2 6h-12l2-6z" fill="#E8C547" />
          <rect x="30" y="18" width="4" height="24" fill="#fff" />
          <path d="M16 46h32l-2 6H18l-2-6z" fill="#fff" />
          <path d="M20 42h24l-1 4H21l-1-4z" fill="#fff" opacity="0.85" />
        </svg>
      )
    case 'music-teacher':
      return (
        <svg {...common}>
          <circle cx="22" cy="42" r="8" fill="#fff" />
          <path d="M28 42V16l18-4v26" stroke="#E8C547" strokeWidth="4" fill="none" />
          <circle cx="46" cy="38" r="7" fill="#fff" />
        </svg>
      )
    case 'dance-teacher':
      return (
        <svg {...common}>
          <circle cx="32" cy="14" r="6" fill="#fff" />
          <path d="M32 22v12" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          <path d="M22 28l10 4 10-4" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M38 34l8-10" stroke="#E8C547" strokeWidth="4" strokeLinecap="round" />
          <path d="M26 34l-6 14" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          <path d="M38 46l6 6" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )
    case 'yoga':
      return (
        <svg {...common}>
          <circle cx="32" cy="18" r="6" fill="#fff" />
          <path d="M20 38c4-6 8-8 12-8s8 2 12 8" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M24 38v10M40 38v10" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          <path d="M26 48h12" stroke="#E8C547" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="32" cy="52" rx="10" ry="3" fill="#E8C547" opacity="0.5" />
        </svg>
      )
    case 'driver':
      return (
        <svg {...common}>
          <rect x="8" y="28" width="48" height="18" rx="4" fill="#fff" />
          <path d="M16 28l8-12h16l8 12" fill="#fff" opacity="0.9" />
          <circle cx="18" cy="46" r="5" fill="#1A1A1A" />
          <circle cx="46" cy="46" r="5" fill="#1A1A1A" />
          <circle cx="18" cy="46" r="2" fill="#E8C547" />
          <circle cx="46" cy="46" r="2" fill="#E8C547" />
        </svg>
      )
    case 'painter':
      return (
        <svg {...common}>
          <rect x="18" y="12" width="20" height="28" rx="3" fill="#fff" />
          <path d="M22 40h12l4 12H18l4-12z" fill="#E8C547" />
          <path d="M42 20c6 2 10 8 10 14" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )
    case 'plumber':
      return (
        <svg {...common}>
          <path d="M18 20h12v8H18z" fill="#fff" />
          <path d="M26 28h8v20c0 4-3 6-6 6s-6-2-6-6V36" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="44" cy="24" r="8" stroke="#E8C547" strokeWidth="4" />
          <path d="M44 16v16M36 24h16" stroke="#E8C547" strokeWidth="3" />
        </svg>
      )
    case 'electrician':
      return (
        <svg {...common}>
          <path d="M36 8L20 34h12l-4 22 20-30H34l2-18z" fill="#E8C547" />
        </svg>
      )
    case 'appliance-repair':
      return (
        <svg {...common}>
          <rect x="12" y="14" width="40" height="36" rx="3" fill="#fff" />
          <rect x="18" y="20" width="28" height="14" rx="2" fill="#1B6B5A" opacity="0.85" />
          <path d="M22 40h20M22 44h14" stroke="#1B6B5A" strokeWidth="2" strokeLinecap="round" />
          <path d="M46 10l4 4-4 4M50 14h-8" stroke="#E8C547" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M48 8l2 2M50 10l-2 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    case 'mobile-repair':
      return (
        <svg {...common}>
          <rect x="22" y="10" width="20" height="44" rx="4" fill="#fff" />
          <rect x="26" y="16" width="12" height="28" rx="1" fill="#1B6B5A" />
          <circle cx="32" cy="48" r="2" fill="#E8C547" />
          <path d="M28 22h8M28 26h6" stroke="#E8C547" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    case 'tv-repair':
      return (
        <svg {...common}>
          <rect x="10" y="14" width="44" height="30" rx="3" fill="#fff" />
          <rect x="16" y="20" width="32" height="18" rx="1" fill="#1B6B5A" opacity="0.85" />
          <path d="M24 48h16l-2 4H26l-2-4z" fill="#fff" />
          <path d="M38 38l6 4" stroke="#E8C547" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    case 'computer-trainer':
      return (
        <svg {...common}>
          <rect x="10" y="14" width="44" height="28" rx="3" fill="#fff" />
          <rect x="16" y="20" width="32" height="16" fill="#1B6B5A" opacity="0.85" />
          <rect x="22" y="46" width="20" height="4" rx="1" fill="#E8C547" />
          <circle cx="32" cy="28" r="4" fill="#E8C547" />
        </svg>
      )
    case 'physio':
      return (
        <svg {...common}>
          <circle cx="40" cy="16" r="5" fill="#fff" />
          <path d="M34 24h12l-6 20" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M28 44l12-8" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          <path d="M14 30c8-4 16-4 24 0" stroke="#E8C547" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M12 34c8 4 16 4 24 0" stroke="#E8C547" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      )
    case 'pharmacist':
      return (
        <svg {...common}>
          <rect x="24" y="14" width="16" height="36" rx="8" fill="#fff" />
          <rect x="28" y="28" width="8" height="14" rx="1" fill="#C94A4A" />
          <circle cx="32" cy="22" r="4" fill="#E8C547" />
          <rect x="30" y="20" width="4" height="4" rx="1" fill="#fff" />
        </svg>
      )
    case 'advocate':
      return (
        <svg {...common}>
          <path d="M32 12v8" stroke="#E8C547" strokeWidth="3" strokeLinecap="round" />
          <path d="M20 20h24" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          <path d="M16 20v4c0 6 6 10 16 10s16-4 16-10v-4" stroke="#fff" strokeWidth="3" fill="none" />
          <path d="M22 20v4c0 4 4 8 10 8" stroke="#E8C547" strokeWidth="2.5" fill="none" />
          <path d="M42 20v4c0 4-4 8-10 8" stroke="#E8C547" strokeWidth="2.5" fill="none" />
          <rect x="28" y="44" width="8" height="8" fill="#fff" />
        </svg>
      )
    case 'ca':
      return (
        <svg {...common}>
          <rect x="16" y="12" width="32" height="40" rx="4" fill="#fff" />
          <rect x="22" y="18" width="20" height="12" rx="2" fill="#1B6B5A" opacity="0.85" />
          <rect x="24" y="34" width="6" height="6" rx="1" fill="#E8C547" />
          <rect x="34" y="34" width="6" height="6" rx="1" fill="#fff" stroke="#1B6B5A" strokeWidth="1.5" />
          <rect x="24" y="44" width="6" height="6" rx="1" fill="#fff" stroke="#1B6B5A" strokeWidth="1.5" />
          <rect x="34" y="44" width="6" height="6" rx="1" fill="#E8C547" />
        </svg>
      )
    case 'accountant-gst':
      return (
        <svg {...common}>
          <rect x="16" y="12" width="32" height="40" rx="3" fill="#fff" />
          <path d="M22 22h20M22 30h20M22 38h14" stroke="#1B6B5A" strokeWidth="2.5" strokeLinecap="round" />
          <text x="40" y="26" textAnchor="middle" fill="#E8C547" fontSize="14" fontWeight="bold" fontFamily="sans-serif">%</text>
        </svg>
      )
    case 'tax-consultant':
      return (
        <svg {...common}>
          <rect x="16" y="12" width="32" height="40" rx="3" fill="#fff" />
          <path d="M22 22h20M22 30h20M22 38h14" stroke="#1B6B5A" strokeWidth="2.5" strokeLinecap="round" />
          <text x="40" y="36" textAnchor="middle" fill="#E8C547" fontSize="16" fontWeight="bold" fontFamily="sans-serif">₹</text>
        </svg>
      )
    case 'banking-help':
      return (
        <svg {...common}>
          <path d="M12 28l20-14 20 14v22H12V28z" fill="#fff" />
          <rect x="12" y="28" width="40" height="6" fill="#E8C547" />
          <rect x="26" y="38" width="12" height="12" fill="#1B6B5A" />
          <path d="M18 22h28" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'company-registration':
      return (
        <svg {...common}>
          <rect x="14" y="20" width="36" height="28" rx="3" fill="#fff" />
          <path d="M14 28h36" stroke="#E8C547" strokeWidth="2" />
          <rect x="22" y="34" width="20" height="3" rx="1" fill="#1B6B5A" />
          <rect x="22" y="40" width="14" height="3" rx="1" fill="#1B6B5A" />
          <path d="M22 14h20v8H22z" fill="#E8C547" />
        </svg>
      )
    case 'notary':
      return (
        <svg {...common}>
          <rect x="16" y="12" width="32" height="40" rx="3" fill="#fff" />
          <path d="M22 22h20M22 30h20M22 38h14" stroke="#1B6B5A" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="34" y="36" width="14" height="14" rx="2" fill="#E8C547" />
          <text x="41" y="47" textAnchor="middle" fill="#1B6B5A" fontSize="10" fontWeight="bold" fontFamily="sans-serif">OK</text>
        </svg>
      )
    case 'document-writer':
      return (
        <svg {...common}>
          <rect x="16" y="12" width="32" height="40" rx="3" fill="#fff" />
          <path d="M22 22h20M22 30h20M22 38h14" stroke="#1B6B5A" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M44 44l8-8" stroke="#E8C547" strokeWidth="3" strokeLinecap="round" />
          <path d="M46 36l6 6-2 4h-4l-2-4 2-6z" fill="#E8C547" />
        </svg>
      )
    case 'passport':
      return (
        <svg {...common}>
          <rect x="18" y="10" width="28" height="44" rx="3" fill="#1B6B5A" />
          <rect x="22" y="14" width="20" height="36" rx="2" fill="#fff" />
          <circle cx="32" cy="28" r="6" fill="#E8C547" opacity="0.6" />
          <path d="M24 40h16M24 44h12" stroke="#1B6B5A" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'pan-aadhaar':
      return (
        <svg {...common}>
          <rect x="12" y="18" width="40" height="28" rx="4" fill="#fff" />
          <rect x="16" y="22" width="14" height="16" rx="2" fill="#1B6B5A" opacity="0.7" />
          <path d="M34 26h16M34 32h14M34 38h10" stroke="#1B6B5A" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="16" y="42" width="32" height="2" fill="#E8C547" />
        </svg>
      )
    case 'eseva':
      return (
        <svg {...common}>
          <rect x="10" y="14" width="44" height="36" rx="3" fill="#fff" />
          <rect x="16" y="20" width="32" height="20" rx="2" fill="#1B6B5A" opacity="0.85" />
          <rect x="20" y="44" width="24" height="4" rx="1" fill="#E8C547" />
          <path d="M24 28h16M24 34h12" stroke="#E8C547" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'rto-paperwork':
      return (
        <svg {...common}>
          <rect x="6" y="30" width="28" height="14" rx="3" fill="#fff" />
          <circle cx="14" cy="46" r="4" fill="#1A1A1A" />
          <circle cx="26" cy="46" r="4" fill="#1A1A1A" />
          <rect x="36" y="14" width="22" height="28" rx="2" fill="#fff" />
          <path d="M40 22h14M40 28h14M40 34h10" stroke="#1B6B5A" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'delivery-boy':
      return (
        <svg {...common}>
          <ellipse cx="20" cy="48" rx="8" ry="8" fill="#1A1A1A" />
          <ellipse cx="44" cy="48" rx="8" ry="8" fill="#1A1A1A" />
          <path d="M14 38h24l4-10h10l-2 10" stroke="#fff" strokeWidth="3" strokeLinejoin="round" fill="#fff" />
          <rect x="28" y="18" width="14" height="12" rx="2" fill="#E8C547" />
          <path d="M18 38l6-12" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'mechanic':
      return (
        <svg {...common}>
          <path d="M20 18l8 8-4 4 8 8 4-4 8 8-6 6-20-20 6-6z" fill="#fff" />
          <circle cx="44" cy="20" r="10" stroke="#E8C547" strokeWidth="4" />
          <circle cx="44" cy="20" r="3" fill="#E8C547" />
        </svg>
      )
    case 'auto-electrician':
      return (
        <svg {...common}>
          <rect x="8" y="30" width="32" height="14" rx="3" fill="#fff" />
          <circle cx="16" cy="46" r="4" fill="#1A1A1A" />
          <circle cx="32" cy="46" r="4" fill="#1A1A1A" />
          <path d="M44 14l-8 16h6l-4 12 14-20h-6l2-8z" fill="#E8C547" />
        </svg>
      )
    case 'car-wash':
      return (
        <svg {...common}>
          <rect x="8" y="28" width="48" height="14" rx="4" fill="#fff" />
          <path d="M16 28l8-10h16l8 10" fill="#fff" opacity="0.9" />
          <circle cx="18" cy="44" r="5" fill="#1A1A1A" />
          <circle cx="46" cy="44" r="5" fill="#1A1A1A" />
          <path d="M24 16c4-6 12-6 16 0" stroke="#E8C547" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      )
    case 'puncture-shop':
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="18" stroke="#fff" strokeWidth="5" />
          <circle cx="32" cy="32" r="6" fill="#E8C547" />
          <path d="M32 14v8M32 42v8M14 32h8M42 32h8" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'battery-service':
      return (
        <svg {...common}>
          <rect x="14" y="22" width="40" height="24" rx="4" fill="#fff" />
          <rect x="54" y="28" width="4" height="12" rx="1" fill="#E8C547" />
          <rect x="20" y="28" width="8" height="12" fill="#1B6B5A" />
          <rect x="32" y="28" width="8" height="12" fill="#E8C547" />
          <rect x="44" y="28" width="4" height="12" fill="#1B6B5A" />
          <path d="M22 18h20" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'towing':
      return (
        <svg {...common}>
          <rect x="6" y="30" width="28" height="14" rx="3" fill="#fff" />
          <path d="M34 36h16l4 8H34" fill="#E8C547" />
          <circle cx="14" cy="46" r="5" fill="#1A1A1A" />
          <circle cx="44" cy="46" r="5" fill="#1A1A1A" />
        </svg>
      )
    case 'carpenter':
      return (
        <svg {...common}>
          <path d="M18 18l10 10-4 4 8 8 4-4 10 10-6 6-22-22 6-6z" fill="#fff" />
          <rect x="40" y="14" width="12" height="8" fill="#E8C547" />
        </svg>
      )
    case 'mason':
      return (
        <svg {...common}>
          <rect x="10" y="40" width="44" height="10" fill="#fff" />
          <rect x="14" y="30" width="16" height="10" fill="#fff" opacity="0.95" />
          <rect x="34" y="30" width="16" height="10" fill="#fff" opacity="0.95" />
          <rect x="24" y="20" width="16" height="10" fill="#fff" />
          <rect x="40" y="12" width="10" height="8" fill="#E8C547" />
        </svg>
      )
    case 'laptop-repair':
      return (
        <svg {...common}>
          <rect x="12" y="16" width="40" height="26" rx="3" fill="#fff" />
          <rect x="16" y="20" width="32" height="18" rx="1" fill="#1B6B5A" opacity="0.85" />
          <path d="M8 44h48l-4 4H12l-4-4z" fill="#fff" />
          <path d="M38 28l6 6" stroke="#E8C547" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    case 'printer-repair':
      return (
        <svg {...common}>
          <rect x="12" y="24" width="40" height="20" rx="3" fill="#fff" />
          <rect x="20" y="14" width="24" height="12" fill="#fff" />
          <rect x="20" y="40" width="24" height="10" fill="#E8C547" />
          <rect x="26" y="28" width="12" height="8" fill="#1B6B5A" opacity="0.7" />
        </svg>
      )
    case 'contractor':
      return (
        <svg {...common}>
          <rect x="10" y="40" width="44" height="10" fill="#fff" />
          <rect x="14" y="30" width="16" height="10" fill="#fff" opacity="0.95" />
          <rect x="34" y="30" width="16" height="10" fill="#fff" opacity="0.95" />
          <rect x="24" y="20" width="16" height="10" fill="#fff" />
          <circle cx="48" cy="16" r="8" fill="#E8C547" />
          <path d="M44 16h8M48 12v8" stroke="#1B6B5A" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'gardener':
      return (
        <svg {...common}>
          <path d="M32 12c10 8 14 18 14 28a14 14 0 11-28 0c0-10 4-20 14-28z" fill="#fff" />
          <rect x="29" y="40" width="6" height="14" fill="#E8C547" />
        </svg>
      )
    case 'pest-control':
      return (
        <svg {...common}>
          <circle cx="32" cy="30" r="12" fill="#fff" />
          <path d="M20 20l24 24M44 20L20 44" stroke="#C94A4A" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )
    case 'tailor':
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="18" stroke="#fff" strokeWidth="3" />
          <path d="M32 14v36M14 32h36" stroke="#fff" strokeWidth="2" />
          <circle cx="32" cy="32" r="4" fill="#E8C547" />
          <path d="M40 40l10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'laundry':
      return (
        <svg {...common}>
          <rect x="14" y="16" width="36" height="36" rx="4" fill="#fff" />
          <circle cx="32" cy="36" r="10" stroke="#1B6B5A" strokeWidth="3" />
          <circle cx="32" cy="36" r="4" fill="#E8C547" />
          <rect x="20" y="20" width="24" height="6" rx="1" fill="#1B6B5A" />
        </svg>
      )
    case 'maid':
      return (
        <svg {...common}>
          <path d="M20 44c0-10 5-18 12-18s12 8 12 18" fill="#fff" />
          <circle cx="32" cy="18" r="7" fill="#fff" />
          <path d="M14 48h36v4H14z" fill="#E8C547" />
          <path d="M42 30c6 2 10 8 10 14" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'cook':
      return (
        <svg {...common}>
          <ellipse cx="32" cy="22" rx="16" ry="8" fill="#fff" />
          <rect x="18" y="22" width="28" height="8" fill="#fff" />
          <path d="M14 36h36l-4 14H18l-4-14z" fill="#fff" />
          <rect x="28" y="30" width="8" height="6" fill="#E8C547" />
        </svg>
      )
    case 'caretaker':
      return (
        <svg {...common}>
          <circle cx="24" cy="22" r="7" fill="#fff" />
          <circle cx="42" cy="26" r="5" fill="#fff" opacity="0.9" />
          <path d="M12 48c2-10 8-16 12-16s10 6 12 16" fill="#fff" />
          <path d="M34 48c1-8 5-12 8-12s7 4 8 12" fill="#fff" opacity="0.9" />
          <path d="M28 34c4 2 8 2 12 0" stroke="#E8C547" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'elder-care':
      return (
        <svg {...common}>
          <circle cx="32" cy="18" r="7" fill="#fff" />
          <path d="M18 50c2-12 8-18 14-18s12 6 14 18" fill="#fff" />
          <path d="M22 34h20" stroke="#E8C547" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'beautician':
      return (
        <svg {...common}>
          <path d="M32 12c8 8 14 16 14 26a14 14 0 11-28 0c0-10 6-18 14-26z" fill="#fff" />
          <circle cx="32" cy="36" r="5" fill="#E8C547" />
          <path d="M32 12v8" stroke="#E8C547" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'mehendi':
      return (
        <svg {...common}>
          <path d="M20 44c0-12 6-22 12-28 6 6 12 16 12 28" fill="#fff" />
          <circle cx="32" cy="36" r="4" fill="#E8C547" />
          <path d="M26 28c4 2 8 2 12 0" stroke="#6B3A2A" strokeWidth="2" />
        </svg>
      )
    case 'artist':
      return (
        <svg {...common}>
          <rect x="14" y="14" width="36" height="28" rx="2" fill="#fff" />
          <path d="M20 36l8-12 6 8 6-10 8 14H20z" fill="#1B6B5A" opacity="0.85" />
          <path d="M44 40l6 12M48 46h8" stroke="#E8C547" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'graphic-designer':
      return (
        <svg {...common}>
          <rect x="12" y="14" width="40" height="28" rx="3" fill="#fff" />
          <circle cx="24" cy="28" r="5" fill="#E8C547" />
          <path d="M34 22h12M34 28h10M34 34h8" stroke="#1B6B5A" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="24" y="46" width="16" height="4" fill="#fff" />
        </svg>
      )
    case 'uiux-designer':
      return (
        <svg {...common}>
          <rect x="20" y="10" width="24" height="44" rx="4" fill="#fff" />
          <rect x="24" y="16" width="16" height="24" rx="1" fill="#1B6B5A" opacity="0.85" />
          <rect x="26" y="20" width="12" height="4" rx="1" fill="#E8C547" />
          <rect x="26" y="28" width="8" height="4" rx="1" fill="#fff" opacity="0.8" />
          <rect x="26" y="36" width="10" height="4" rx="1" fill="#fff" opacity="0.8" />
        </svg>
      )
    case 'website-designer':
      return (
        <svg {...common}>
          <rect x="10" y="14" width="44" height="30" rx="3" fill="#fff" />
          <rect x="10" y="14" width="44" height="8" fill="#E8C547" />
          <circle cx="16" cy="18" r="1.5" fill="#1B6B5A" />
          <circle cx="21" cy="18" r="1.5" fill="#1B6B5A" />
          <path d="M18 30h12M18 36h20" stroke="#1B6B5A" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="24" y="48" width="16" height="4" rx="1" fill="#fff" />
        </svg>
      )
    case 'software-developer':
      return (
        <svg {...common}>
          <path d="M18 20l-8 12 8 12M46 20l8 12-8 12M36 16l-8 32" stroke="#E8C547" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'app-developer':
      return (
        <svg {...common}>
          <rect x="18" y="10" width="28" height="44" rx="6" fill="#fff" />
          <rect x="22" y="16" width="20" height="32" rx="2" fill="#1B6B5A" opacity="0.85" />
          <rect x="26" y="22" width="12" height="12" rx="3" fill="#E8C547" />
          <circle cx="32" cy="50" r="2" fill="#E8C547" />
        </svg>
      )
    case 'content-creator':
      return (
        <svg {...common}>
          <rect x="14" y="18" width="36" height="24" rx="4" fill="#fff" />
          <circle cx="32" cy="30" r="7" stroke="#1B6B5A" strokeWidth="3" />
          <circle cx="32" cy="30" r="3" fill="#E8C547" />
          <path d="M44 18l6-4v12l-6-4" fill="#fff" />
        </svg>
      )
    case 'video-editor':
      return (
        <svg {...common}>
          <rect x="10" y="20" width="44" height="28" rx="3" fill="#fff" />
          <path d="M18 20v-6h28v6" stroke="#E8C547" strokeWidth="3" strokeLinecap="round" />
          <path d="M26 28h20" stroke="#1B6B5A" strokeWidth="3" strokeLinecap="round" />
          <path d="M22 36l8-4v12l-8-4v-4z" fill="#E8C547" />
        </svg>
      )
    case 'digital-marketing':
      return (
        <svg {...common}>
          <path d="M14 40V24c0-4 3-8 8-8h12c5 0 8 4 8 8v16" stroke="#fff" strokeWidth="3" fill="none" />
          <path d="M10 40h32" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          <path d="M42 28c6 2 10 8 10 14v4H42V28z" fill="#E8C547" />
          <path d="M46 32v4M44 34h4" stroke="#1B6B5A" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    case 'seo':
      return (
        <svg {...common}>
          <circle cx="28" cy="28" r="14" stroke="#fff" strokeWidth="4" />
          <path d="M38 38l12 12" stroke="#E8C547" strokeWidth="5" strokeLinecap="round" />
          <path d="M22 28h12M28 22v12" stroke="#1B6B5A" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'social-media':
      return (
        <svg {...common}>
          <circle cx="20" cy="24" r="6" fill="#fff" />
          <circle cx="44" cy="24" r="6" fill="#fff" />
          <circle cx="32" cy="44" r="6" fill="#fff" />
          <path d="M25 26l4 14M39 26l-4 14M26 24h12" stroke="#E8C547" strokeWidth="2.5" />
          <path d="M18 20c-2-2-2-4 0-4s2 2 0 4zM46 20c2-2 2-4 0-4s-2 2 0 4z" fill="#C94A4A" />
        </svg>
      )
    case 'data-entry':
      return (
        <svg {...common}>
          <rect x="14" y="14" width="36" height="36" rx="3" fill="#fff" />
          <path d="M20 24h24M20 32h24M20 40h16" stroke="#1B6B5A" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="38" y="38" width="8" height="8" rx="1" fill="#E8C547" />
        </svg>
      )
    case 'telecaller':
      return (
        <svg {...common}>
          <rect x="22" y="10" width="20" height="36" rx="4" fill="#fff" />
          <rect x="26" y="16" width="12" height="20" rx="1" fill="#1B6B5A" />
          <circle cx="32" cy="42" r="2" fill="#1B6B5A" />
          <path d="M14 28c-4 4-4 12 0 16M50 28c4 4 4 12 0 16" stroke="#E8C547" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'event-planner':
      return (
        <svg {...common}>
          <rect x="12" y="18" width="40" height="32" rx="3" fill="#fff" />
          <rect x="12" y="18" width="40" height="10" fill="#E8C547" />
          <path d="M22 14v8M42 14v8" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="24" cy="38" r="3" fill="#1B6B5A" />
          <circle cx="32" cy="38" r="3" fill="#1B6B5A" />
          <circle cx="40" cy="38" r="3" fill="#1B6B5A" />
        </svg>
      )
    case 'wedding-broker':
      return (
        <svg {...common}>
          <circle cx="22" cy="24" r="7" fill="#fff" />
          <circle cx="42" cy="24" r="7" fill="#fff" />
          <path d="M12 48c2-10 6-16 10-16s8 6 10 16" fill="#fff" />
          <path d="M32 48c2-10 6-16 10-16s8 6 10 16" fill="#fff" />
          <path d="M28 28c2 4 6 4 8 0" stroke="#E8C547" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'cameraman':
      return (
        <svg {...common}>
          <rect x="14" y="18" width="36" height="24" rx="4" fill="#fff" />
          <circle cx="32" cy="30" r="7" stroke="#1B6B5A" strokeWidth="3" />
          <circle cx="32" cy="30" r="3" fill="#E8C547" />
          <path d="M44 18l6-4v12l-6-4" fill="#fff" />
        </svg>
      )
    case 'anchor':
      return (
        <svg {...common}>
          <rect x="26" y="10" width="12" height="22" rx="6" fill="#fff" />
          <path d="M20 24c0 6 4 10 12 10s12-4 12-10" stroke="#E8C547" strokeWidth="3" fill="none" />
          <rect x="30" y="32" width="4" height="14" fill="#fff" />
          <rect x="20" y="46" width="24" height="4" rx="1" fill="#fff" />
          <circle cx="32" cy="16" r="3" fill="#1B6B5A" />
        </svg>
      )
    case 'motivational-speaker':
      return (
        <svg {...common}>
          <rect x="16" y="36" width="32" height="6" rx="1" fill="#E8C547" />
          <rect x="28" y="28" width="8" height="8" fill="#fff" />
          <circle cx="32" cy="18" r="7" fill="#fff" />
          <path d="M20 48c2-10 6-16 12-16s10 6 12 16" fill="#fff" />
          <path d="M26 24l-4-6M38 24l4-6" stroke="#E8C547" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'gym-trainer':
      return (
        <svg {...common}>
          <rect x="8" y="26" width="10" height="12" rx="2" fill="#fff" />
          <rect x="46" y="26" width="10" height="12" rx="2" fill="#fff" />
          <rect x="18" y="30" width="28" height="4" fill="#E8C547" />
          <rect x="14" y="24" width="6" height="16" rx="1" fill="#fff" />
          <rect x="44" y="24" width="6" height="16" rx="1" fill="#fff" />
        </svg>
      )
    case 'property-consultant':
      return (
        <svg {...common}>
          <path d="M12 28l20-14 20 14v22H12V28z" fill="#fff" />
          <rect x="26" y="34" width="12" height="16" fill="#E8C547" />
        </svg>
      )
    case 'rental-agent':
      return (
        <svg {...common}>
          <path d="M14 30l18-12 18 12v20H14V30z" fill="#fff" />
          <rect x="26" y="36" width="12" height="14" fill="#E8C547" />
          <text x="32" y="28" textAnchor="middle" fill="#1B6B5A" fontSize="10" fontWeight="bold" fontFamily="sans-serif">RENT</text>
        </svg>
      )
    case 'security':
      return (
        <svg {...common}>
          <path d="M32 10l18 8v14c0 12-8 20-18 24-10-4-18-12-18-24V18l18-8z" fill="#fff" />
          <path d="M26 32l5 5 10-12" stroke="#1B6B5A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'employee':
      return (
        <svg {...common}>
          <circle cx="32" cy="18" r="7" fill="#fff" />
          <path d="M18 52c2-14 6-20 14-20s12 6 14 20" fill="#fff" />
          <rect x="24" y="32" width="16" height="12" rx="2" fill="#E8C547" />
        </svg>
      )
    case 'office-boy':
      return (
        <svg {...common}>
          <rect x="20" y="28" width="24" height="20" rx="2" fill="#fff" />
          <path d="M24 28v-6h16v6" stroke="#E8C547" strokeWidth="2.5" fill="none" />
          <circle cx="32" cy="16" r="6" fill="#fff" />
          <path d="M26 36h12M26 42h8" stroke="#1B6B5A" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'report-automation':
      return (
        <svg {...common}>
          <rect x="10" y="14" width="44" height="32" rx="3" fill="#fff" />
          <path d="M18 36V28M26 36V22M34 36V26M42 36V18" stroke="#1B6B5A" strokeWidth="4" strokeLinecap="round" />
          <path d="M46 12l4 4-8 8" stroke="#E8C547" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    case 'business-analyst':
      return (
        <svg {...common}>
          <rect x="10" y="14" width="44" height="32" rx="3" fill="#fff" />
          <path d="M18 36V28M26 36V22M34 36V26M42 36V18" stroke="#1B6B5A" strokeWidth="4" strokeLinecap="round" />
          <circle cx="48" cy="16" r="6" fill="#E8C547" />
          <path d="M45 16h6M48 13v6" stroke="#1B6B5A" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    case 'welder':
      return (
        <svg {...common}>
          <path d="M16 44l16-20 8 8-16 20H16v-8z" fill="#fff" />
          <path d="M36 20c4 0 8 4 8 8" stroke="#E8C547" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="48" cy="22" r="4" fill="#C94A4A" />
          <path d="M46 20l4 4M50 20l-4 4" stroke="#E8C547" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'locksmith':
      return (
        <svg {...common}>
          <circle cx="32" cy="36" r="14" stroke="#fff" strokeWidth="4" />
          <rect x="28" y="14" width="8" height="18" rx="2" fill="#E8C547" />
          <circle cx="32" cy="22" r="3" fill="#1B6B5A" />
        </svg>
      )
    case 'packers-movers':
      return (
        <svg {...common}>
          <rect x="10" y="24" width="24" height="20" rx="2" fill="#fff" />
          <rect x="14" y="28" width="16" height="4" fill="#E8C547" />
          <rect x="36" y="20" width="18" height="24" rx="2" fill="#fff" />
          <path d="M40 28h10M40 34h8" stroke="#1B6B5A" strokeWidth="2" strokeLinecap="round" />
          <circle cx="18" cy="48" r="4" fill="#1A1A1A" />
          <circle cx="46" cy="48" r="4" fill="#1A1A1A" />
        </svg>
      )
    case 'deep-cleaning':
      return (
        <svg {...common}>
          <path d="M20 14h24l-4 36H24l-4-36z" fill="#fff" />
          <rect x="26" y="10" width="12" height="6" rx="2" fill="#E8C547" />
          <path d="M14 50c6-4 12-4 18 0s12 0 18 0" stroke="#1B6B5A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="32" cy="32" r="4" fill="#E8C547" opacity="0.6" />
        </svg>
      )
    case 'interior-designer':
      return (
        <svg {...common}>
          <rect x="12" y="20" width="40" height="28" rx="2" fill="#fff" />
          <rect x="16" y="24" width="14" height="10" fill="#E8C547" />
          <rect x="34" y="24" width="14" height="10" fill="#1B6B5A" opacity="0.7" />
          <rect x="24" y="38" width="16" height="6" fill="#1B6B5A" />
          <path d="M20 16h24" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'vastu':
      return (
        <svg {...common}>
          <rect x="16" y="16" width="32" height="32" fill="#fff" />
          <path d="M16 16h32v32H16z" stroke="#E8C547" strokeWidth="2" fill="none" />
          <path d="M16 32h32M32 16v32" stroke="#1B6B5A" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="3" fill="#E8C547" />
          <text x="40" y="42" textAnchor="middle" fill="#1B6B5A" fontSize="8" fontFamily="sans-serif">N</text>
        </svg>
      )
    case 'translator':
      return (
        <svg {...common}>
          <rect x="10" y="16" width="22" height="28" rx="2" fill="#fff" />
          <rect x="32" y="20" width="22" height="28" rx="2" fill="#fff" />
          <text x="21" y="34" textAnchor="middle" fill="#1B6B5A" fontSize="12" fontWeight="bold" fontFamily="sans-serif">A</text>
          <text x="43" y="38" textAnchor="middle" fill="#E8C547" fontSize="12" fontWeight="bold" fontFamily="sans-serif">अ</text>
          <path d="M28 30l4 4-4 4" stroke="#E8C547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'insurance-agent':
      return (
        <svg {...common}>
          <path d="M32 10l18 8v14c0 12-8 20-18 24-10-4-18-12-18-24V18l18-8z" fill="#fff" />
          <text x="32" y="36" textAnchor="middle" fill="#1B6B5A" fontSize="14" fontWeight="bold" fontFamily="sans-serif">$</text>
        </svg>
      )
    case 'cctv-installer':
      return (
        <svg {...common}>
          <path d="M18 28h20l8 6v8H18v-14z" fill="#fff" />
          <circle cx="28" cy="34" r="5" stroke="#1B6B5A" strokeWidth="2" />
          <circle cx="28" cy="34" r="2" fill="#E8C547" />
          <path d="M46 34h6M49 30v8" stroke="#E8C547" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'solar-installer':
      return (
        <svg {...common}>
          <rect x="10" y="28" width="44" height="20" rx="2" fill="#1B6B5A" />
          <path d="M10 38h44M26 28v20M42 28v20" stroke="#fff" strokeWidth="1.5" />
          <circle cx="48" cy="14" r="8" fill="#E8C547" />
          <path d="M48 6v16M40 14h16" stroke="#E8C547" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'water-purifier':
      return (
        <svg {...common}>
          <rect x="24" y="10" width="16" height="40" rx="4" fill="#fff" />
          <rect x="28" y="16" width="8" height="12" rx="1" fill="#1B6B5A" opacity="0.7" />
          <path d="M20 36h24" stroke="#E8C547" strokeWidth="3" strokeLinecap="round" />
          <path d="M32 28v8" stroke="#1B6B5A" strokeWidth="2" strokeLinecap="round" />
          <circle cx="32" cy="44" r="3" fill="#E8C547" />
        </svg>
      )
    case 'borewell':
      return (
        <svg {...common}>
          <rect x="28" y="10" width="8" height="40" fill="#fff" />
          <path d="M16 50h32" stroke="#E8C547" strokeWidth="3" strokeLinecap="round" />
          <path d="M32 18v24M24 26h16M24 34h16" stroke="#1B6B5A" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="32" cy="52" rx="12" ry="3" fill="#1B6B5A" opacity="0.5" />
        </svg>
      )
    case 'cobbler':
      return (
        <svg {...common}>
          <path d="M16 40c4-8 12-12 20-8 4 2 8 8 8 14H16v-6z" fill="#fff" />
          <path d="M36 28l12-8 4 6-12 8-4-6z" fill="#E8C547" />
          <path d="M40 20l4 4" stroke="#1B6B5A" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'watch-repair':
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="18" stroke="#fff" strokeWidth="4" />
          <circle cx="32" cy="32" r="2" fill="#E8C547" />
          <path d="M32 32V20M32 32l8 6" stroke="#E8C547" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="28" y="8" width="8" height="6" rx="1" fill="#fff" />
          <rect x="28" y="50" width="8" height="6" rx="1" fill="#fff" />
        </svg>
      )
    case 'florist':
      return (
        <svg {...common}>
          <circle cx="32" cy="22" r="10" fill="#E8C547" />
          <circle cx="22" cy="28" r="7" fill="#fff" />
          <circle cx="42" cy="28" r="7" fill="#fff" />
          <circle cx="26" cy="18" r="6" fill="#fff" opacity="0.9" />
          <circle cx="38" cy="18" r="6" fill="#fff" opacity="0.9" />
          <rect x="30" y="32" width="4" height="18" fill="#1B6B5A" />
        </svg>
      )
    case 'pet-groomer':
      return (
        <svg {...common}>
          <circle cx="28" cy="22" r="5" fill="#fff" />
          <circle cx="38" cy="22" r="5" fill="#fff" />
          <ellipse cx="33" cy="32" rx="12" ry="10" fill="#fff" />
          <path d="M22 28l-4 6M44 28l4 6M28 38l-2 8M38 38l2 8" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          <path d="M40 14l4-4M44 18l4-2" stroke="#E8C547" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'resume-writer':
      return (
        <svg {...common}>
          <rect x="18" y="10" width="28" height="44" rx="3" fill="#fff" />
          <circle cx="32" cy="22" r="6" fill="#1B6B5A" opacity="0.6" />
          <path d="M24 34h16M24 40h14M24 46h10" stroke="#1B6B5A" strokeWidth="2" strokeLinecap="round" />
          <path d="M42 38l6 6-8 8h-4v-4l6-10z" fill="#E8C547" />
        </svg>
      )
    case 'scrap-dealer':
      return (
        <svg {...common}>
          <path d="M14 40h36l-4 10H18l-4-10z" fill="#fff" />
          <rect x="18" y="28" width="10" height="12" fill="#E8C547" />
          <rect x="30" y="24" width="8" height="16" fill="#1B6B5A" opacity="0.7" />
          <rect x="40" y="30" width="6" height="10" fill="#fff" />
          <path d="M20 28l4-8h16l4 8" stroke="#fff" strokeWidth="2" fill="none" />
        </svg>
      )
    case 'ambulance-helper':
      return (
        <svg {...common}>
          <rect x="8" y="28" width="40" height="16" rx="3" fill="#fff" />
          <path d="M48 32h8l4 8H48" fill="#C94A4A" />
          <circle cx="18" cy="46" r="4" fill="#1A1A1A" />
          <circle cx="42" cy="46" r="4" fill="#1A1A1A" />
          <rect x="28" y="32" width="8" height="8" fill="#C94A4A" />
          <rect x="30" y="34" width="4" height="4" fill="#fff" />
        </svg>
      )
    case 'dry-cleaning':
      return (
        <svg {...common}>
          <path d="M32 12l-14 36h28L32 12z" fill="#fff" />
          <circle cx="32" cy="36" r="6" stroke="#1B6B5A" strokeWidth="2" />
          <path d="M28 34l4 4 6-8" stroke="#E8C547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="26" y="8" width="12" height="6" rx="2" fill="#E8C547" />
        </svg>
      )
    case 'house-shifting':
      return (
        <svg {...common}>
          <path d="M14 30l18-12 18 12v20H14V30z" fill="#fff" />
          <rect x="26" y="36" width="12" height="14" fill="#E8C547" />
          <path d="M50 20l6 6M50 20l-6 6M50 20v12" stroke="#E8C547" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    case 'glass-glazier':
      return (
        <svg {...common}>
          <rect x="14" y="14" width="36" height="36" rx="2" fill="#fff" opacity="0.4" stroke="#fff" strokeWidth="2" />
          <path d="M14 14l36 36M50 14L14 50" stroke="#E8C547" strokeWidth="2" />
          <rect x="20" y="20" width="8" height="8" fill="#1B6B5A" opacity="0.5" />
          <rect x="36" y="36" width="8" height="8" fill="#1B6B5A" opacity="0.5" />
        </svg>
      )
    case 'surveyor':
      return (
        <svg {...common}>
          <path d="M32 10v36" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          <path d="M20 46h24" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="10" r="4" fill="#E8C547" />
          <path d="M26 22h12l-6 10-6-10z" fill="#E8C547" />
          <path d="M14 34l6-4M50 34l-6-4" stroke="#1B6B5A" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'hr-consultant':
      return (
        <svg {...common}>
          <circle cx="24" cy="22" r="6" fill="#fff" />
          <circle cx="42" cy="22" r="6" fill="#fff" />
          <path d="M14 48c2-10 6-14 10-14s8 4 10 14" fill="#fff" />
          <path d="M32 48c2-10 6-14 10-14s8 4 10 14" fill="#fff" opacity="0.9" />
          <rect x="28" y="34" width="8" height="6" rx="1" fill="#E8C547" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <rect x="14" y="20" width="36" height="28" rx="3" fill="#fff" />
          <path d="M14 28h36" stroke="#E8C547" strokeWidth="2" />
          <rect x="22" y="34" width="20" height="3" rx="1" fill="#1B6B5A" />
          <rect x="22" y="40" width="14" height="3" rx="1" fill="#1B6B5A" />
          <path d="M22 14h20v8H22z" fill="#E8C547" />
        </svg>
      )
  }
})
