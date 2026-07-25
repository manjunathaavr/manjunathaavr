import { useEffect, useRef, useState } from 'react'
import {
  getNotificationCounts,
  getUnreadAcceptedIds,
  getUnreadIncomingIds,
  playNotificationSound,
  REQUESTS_CHANGED_EVENT,
  unlockNotificationAudio,
} from '../lib/notifications'
import { useSession } from './useSession'

export type AppToast = {
  id: number
  message: string
}

export function useAppNotifications() {
  const session = useSession()
  const [incoming, setIncoming] = useState(0)
  const [accepted, setAccepted] = useState(0)
  const [toast, setToast] = useState<AppToast | null>(null)
  const primed = useRef(false)
  const lastIncoming = useRef<Set<string>>(new Set())
  const lastAccepted = useRef<Set<string>>(new Set())
  const toastId = useRef(0)

  useEffect(() => {
    const unlock = () => unlockNotificationAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  useEffect(() => {
    if (!session) {
      setIncoming(0)
      setAccepted(0)
      primed.current = false
      lastIncoming.current = new Set()
      lastAccepted.current = new Set()
      return
    }

    function refresh() {
      const incomingIds = getUnreadIncomingIds()
      const acceptedIds = getUnreadAcceptedIds()
      const counts = getNotificationCounts()
      setIncoming(counts.incoming)
      setAccepted(counts.accepted)

      if (!primed.current) {
        primed.current = true
        lastIncoming.current = new Set(incomingIds)
        lastAccepted.current = new Set(acceptedIds)
        return
      }

      const freshIncoming = incomingIds.filter(
        (id) => !lastIncoming.current.has(id),
      )
      const freshAccepted = acceptedIds.filter(
        (id) => !lastAccepted.current.has(id),
      )

      if (freshIncoming.length > 0 || freshAccepted.length > 0) {
        playNotificationSound()
        const message =
          freshIncoming.length > 0
            ? freshIncoming.length === 1
              ? 'New hire request received'
              : `${freshIncoming.length} new hire requests`
            : freshAccepted.length === 1
              ? 'Your request was accepted'
              : `${freshAccepted.length} requests were accepted`
        toastId.current += 1
        setToast({ id: toastId.current, message })
      }

      lastIncoming.current = new Set(incomingIds)
      lastAccepted.current = new Set(acceptedIds)
    }

    refresh()
    const interval = window.setInterval(refresh, 2500)

    function onStorage(e: StorageEvent) {
      if (e.key === 'swayam-krushi-requests' || e.key?.startsWith('swayam-krushi-seen-')) {
        refresh()
      }
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener(REQUESTS_CHANGED_EVENT, refresh)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(REQUESTS_CHANGED_EVENT, refresh)
    }
  }, [session?.phone, session?.activeRole])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 4500)
    return () => window.clearTimeout(t)
  }, [toast])

  function dismissToast() {
    setToast(null)
  }

  return { incoming, accepted, toast, dismissToast }
}
