import { useSyncExternalStore } from 'react'
import {
  getSession,
  getSessionRaw,
  subscribeSession,
  type SessionUser,
} from '../lib/storage'

export function useSession(): SessionUser | null {
  const raw = useSyncExternalStore(subscribeSession, getSessionRaw, () => null)
  if (!raw) return null
  return getSession()
}
