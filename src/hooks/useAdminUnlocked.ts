import { useSyncExternalStore } from 'react'
import {
  getSessionRaw,
  isSuperAdminSession,
  subscribeSession,
  type SessionUser,
} from '../lib/storage'

function readSuperAdmin(): boolean {
  const raw = getSessionRaw()
  if (!raw) return false
  try {
    return isSuperAdminSession(JSON.parse(raw) as SessionUser)
  } catch {
    return false
  }
}

export function useAdminUnlocked(): boolean {
  return useSyncExternalStore(subscribeSession, readSuperAdmin, () => false)
}
