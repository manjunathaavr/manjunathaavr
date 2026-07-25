'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { BrandLogo } from '@/components/BrandLogo'
import { useAppNotifications } from '@/hooks/useAppNotifications'
import { useSession } from '@/hooks/useSession'
import { clearSession, getMyProfiles, isSuperAdminSession } from '@/lib/storage'

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="nav-badge" aria-label={`${count} new`}>
      {count > 9 ? '9+' : count}
    </span>
  )
}

function guestNavClass(
  base: string,
  isActive: boolean,
  extraActive = false,
): string {
  return `${base}${isActive || extraActive ? ` ${base}--on` : ''}`
}

function navLinkClass(isActive: boolean) {
  return isActive ? 'active' : undefined
}

function HeaderNav() {
  const session = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const role = session?.activeRole
  const isAdmin = isSuperAdminSession(session)
  const { incoming, accepted, toast, dismissToast } = useAppNotifications()
  const hasSkills = Boolean(session && getMyProfiles().length > 0)

  const accountRole = searchParams.get('role')
  const onAccount = pathname === '/account'
  const onHome = pathname === '/'

  function onLogout() {
    clearSession()
    router.push('/account')
  }

  return (
    <>
      <div className="site-header__right">
        {session && (
          <span className="header-welcome">
            Welcome : <strong>{session.name}</strong>
          </span>
        )}

        {(session || !onHome) && (
          <nav className="site-nav" aria-label="Main">
            {!session && (
              <>
                <Link
                  href="/"
                  className={guestNavClass('nav-chip nav-chip--home', onHome)}
                >
                  Home
                </Link>
                <Link
                  href="/account?role=seeker"
                  className={guestNavClass(
                    'nav-chip nav-chip--skill',
                    onAccount && accountRole === 'seeker',
                  )}
                >
                  I have a skill
                </Link>
                <Link
                  href="/account?role=giver"
                  className={guestNavClass(
                    'nav-chip nav-chip--help',
                    onAccount && accountRole === 'giver',
                  )}
                >
                  I need help
                </Link>
                <Link
                  href="/account"
                  className={guestNavClass(
                    'nav-chip nav-chip--login',
                    onAccount && !accountRole,
                  )}
                >
                  Log in
                </Link>
              </>
            )}

            {session && role === 'seeker' && (
              <>
                <Link href="/" className="nav-chip nav-chip--home">
                  Home
                </Link>
                <span className="role-pill" title="You are in I have a skill mode">
                  I have a skill
                </span>
                {hasSkills ? (
                  <Link href="/account" className={navLinkClass(pathname === '/account')}>
                    My skills
                  </Link>
                ) : (
                  <Link href="/offer" className={navLinkClass(pathname.startsWith('/offer'))}>
                    Add skill
                  </Link>
                )}
                <Link
                  href="/requests"
                  className={`nav-link-badge${pathname === '/requests' ? ' active' : ''}`}
                >
                  Incoming
                  <NavBadge count={incoming} />
                </Link>
                {isAdmin && (
                  <Link href="/admin" className={navLinkClass(pathname === '/admin')}>
                    Admin
                  </Link>
                )}
                <button type="button" className="nav-text-btn" onClick={onLogout}>
                  Log out
                </button>
              </>
            )}

            {session && role === 'giver' && (
              <>
                <Link href="/" className="nav-chip nav-chip--home">
                  Home
                </Link>
                <span
                  className="role-pill role-pill--giver"
                  title="You are in I need help mode"
                >
                  I need help
                </span>
                <Link href="/find" className={navLinkClass(pathname.startsWith('/find'))}>
                  Find help
                </Link>
                <Link
                  href="/my-requests"
                  className={`nav-link-badge${pathname === '/my-requests' ? ' active' : ''}`}
                >
                  My requests
                  <NavBadge count={accepted} />
                </Link>
                {isAdmin && (
                  <Link href="/admin" className={navLinkClass(pathname === '/admin')}>
                    Admin
                  </Link>
                )}
                <button type="button" className="nav-text-btn" onClick={onLogout}>
                  Log out
                </button>
              </>
            )}
          </nav>
        )}
      </div>

      {toast && (
        <div className="app-toast" role="status" aria-live="polite">
          <span className="app-toast__dot" aria-hidden="true" />
          <span className="app-toast__msg">{toast.message}</span>
          <button
            type="button"
            className="app-toast__close"
            onClick={dismissToast}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
    </>
  )
}

export function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="brand-mark" aria-label="Swayam Nirman home">
        <BrandLogo className="brand-mark__icon" size={34} />
        <span className="brand-mark__text">
          Swayam <em>Nirman</em>
        </span>
      </Link>

      <Suspense fallback={null}>
        <HeaderNav />
      </Suspense>
    </header>
  )
}
