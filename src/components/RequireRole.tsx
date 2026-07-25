'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { useSession } from '@/hooks/useSession'
import type { UserRole } from '@/lib/storage'

/** Blocks page until user is logged in with the required role. */
export function RequireRole({
  role,
  children,
}: {
  role: UserRole
  children: ReactNode
}) {
  const session = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!session || session.activeRole !== role) {
      router.replace(`/account?role=${role}&tab=login`)
    }
  }, [session, role, router, pathname])

  if (!session || session.activeRole !== role) {
    return null
  }

  return children
}
