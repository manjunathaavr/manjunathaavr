import { useSyncExternalStore } from 'react'
import {
  getAdminUnlockedRaw,
  subscribeAdmin,
} from '../lib/storage'

export function useAdminUnlocked(): boolean {
  const raw = useSyncExternalStore(
    subscribeAdmin,
    getAdminUnlockedRaw,
    () => null,
  )
  return raw === '1'
}
