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

export type CloudAdminData = {
  configured: boolean
  accounts: StoredAccount[]
  profiles: SkillProfile[]
  requests: JobRequest[]
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
