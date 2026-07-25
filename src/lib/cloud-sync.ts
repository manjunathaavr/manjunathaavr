import type { JobRequest, StoredAccount, SkillProfile } from './storage'

type SyncPayload =
  | { type: 'account'; data: StoredAccount }
  | { type: 'profile'; data: SkillProfile }
  | { type: 'request'; data: JobRequest }

/** Fire-and-forget sync to server (safe to call from browser). */
export function syncToCloud(payload: SyncPayload) {
  if (typeof window === 'undefined') return
  fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    /* offline or KV not configured */
  })
}

/** Wait until account is saved to cloud (used on sign-up / login). */
export async function syncAccountToCloudAwait(
  account: StoredAccount,
): Promise<boolean> {
  if (typeof window === 'undefined') return false
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'account', data: account }),
    })
    const data = (await res.json()) as { ok?: boolean; reason?: string }
    return res.ok && data.ok !== false
  } catch {
    return false
  }
}

export type CloudAdminData = {
  configured: boolean
  accounts: StoredAccount[]
  profiles: SkillProfile[]
  requests: JobRequest[]
}

export type CloudUserData = {
  configured: boolean
  account: StoredAccount | null
  profiles: SkillProfile[]
  requests: JobRequest[]
}

export async function fetchCloudUserData(
  phone: string,
): Promise<CloudUserData | null> {
  const key = phone.replace(/\D/g, '').slice(-10)
  if (key.length !== 10) return null
  try {
    const res = await fetch(`/api/user/${key}`, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as CloudUserData
  } catch {
    return null
  }
}

export async function fetchCloudAdminData(
  adminPhone: string,
): Promise<CloudAdminData | null> {
  try {
    const res = await fetch('/api/admin/data', {
      headers: { 'X-Admin-Phone': adminPhone },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return (await res.json()) as CloudAdminData
  } catch {
    return null
  }
}

/** Push this browser's account, skill listings, and requests to the cloud. */
export function syncMyDataToCloud() {
  if (typeof window === 'undefined') return
  import('./storage').then(
    ({
      getAccountByPhone,
      getMyProfiles,
      getRequests,
      getSession,
      normalizePhone,
    }) => {
      const session = getSession()
      if (!session) return

      const accounts: StoredAccount[] = []
      const account = getAccountByPhone(session.phone)
      if (account) accounts.push(account)

      const profiles = getMyProfiles()
      const phone = normalizePhone(session.phone)
      const requests = getRequests().filter(
        (r) => normalizePhone(r.requesterPhone) === phone,
      )

      if (!accounts.length && !profiles.length && !requests.length) return

      fetch('/api/sync/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accounts, profiles, requests }),
        keepalive: true,
      }).catch(() => {
        /* offline or cloud not configured */
      })
    },
  )
}
