import {
  getMyOutgoingRequests,
  getRequestsForOwner,
  getSession,
  normalizePhone,
} from './storage'

const SEEN_INCOMING_KEY = 'swayam-krushi-seen-incoming'
const SEEN_ACCEPTED_KEY = 'swayam-krushi-seen-accepted'

export const REQUESTS_CHANGED_EVENT = 'sk-requests-changed'

export function emitRequestsChanged() {
  try {
    window.dispatchEvent(new CustomEvent(REQUESTS_CHANGED_EVENT))
  } catch {
    /* ignore */
  }
}

function phoneKey(): string | null {
  const session = getSession()
  if (!session) return null
  return normalizePhone(session.phone)
}

function readSeen(key: string): Set<string> {
  const phone = phoneKey()
  if (!phone) return new Set()
  try {
    const raw = localStorage.getItem(`${key}:${phone}`)
    if (!raw) return new Set()
    const list = JSON.parse(raw) as string[]
    return new Set(Array.isArray(list) ? list.map(String) : [])
  } catch {
    return new Set()
  }
}

function writeSeen(key: string, ids: Set<string>) {
  const phone = phoneKey()
  if (!phone) return
  localStorage.setItem(`${key}:${phone}`, JSON.stringify([...ids]))
}

/** Pending hire requests the skill owner has not opened yet */
export function getUnreadIncomingIds(): string[] {
  const seen = readSeen(SEEN_INCOMING_KEY)
  return getRequestsForOwner()
    .filter((r) => r.status === 'pending' && !seen.has(r.id))
    .map((r) => r.id)
}

/** Accepted requests the help-seeker has not opened yet */
export function getUnreadAcceptedIds(): string[] {
  const seen = readSeen(SEEN_ACCEPTED_KEY)
  return getMyOutgoingRequests()
    .filter((r) => r.status === 'accepted' && !seen.has(r.id))
    .map((r) => r.id)
}

export function getNotificationCounts() {
  return {
    incoming: getUnreadIncomingIds().length,
    accepted: getUnreadAcceptedIds().length,
  }
}

/** Call when user opens Incoming requests */
export function markIncomingSeen() {
  const ids = getRequestsForOwner()
    .filter((r) => r.status === 'pending')
    .map((r) => r.id)
  const seen = readSeen(SEEN_INCOMING_KEY)
  ids.forEach((id) => seen.add(id))
  writeSeen(SEEN_INCOMING_KEY, seen)
  emitRequestsChanged()
}

/** Call when user opens My requests */
export function markAcceptedSeen() {
  const ids = getMyOutgoingRequests()
    .filter((r) => r.status === 'accepted')
    .map((r) => r.id)
  const seen = readSeen(SEEN_ACCEPTED_KEY)
  ids.forEach((id) => seen.add(id))
  writeSeen(SEEN_ACCEPTED_KEY, seen)
  emitRequestsChanged()
}

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctx) return null
    if (!audioCtx) audioCtx = new Ctx()
    return audioCtx
  } catch {
    return null
  }
}

/** Unlock audio after a user gesture (required by browsers). */
export function unlockNotificationAudio() {
  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    void ctx.resume()
  }
}

/** Short two-tone chime for new request / accept. */
export function playNotificationSound() {
  const ctx = getAudioContext()
  if (!ctx) return

  void ctx.resume().then(() => {
    const now = ctx.currentTime
    const tones = [
      { freq: 880, start: 0, dur: 0.12 },
      { freq: 1174.66, start: 0.12, dur: 0.18 },
    ]

    for (const tone of tones) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = tone.freq
      gain.gain.setValueAtTime(0.0001, now + tone.start)
      gain.gain.exponentialRampToValueAtTime(0.18, now + tone.start + 0.02)
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + tone.start + tone.dur,
      )
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + tone.start)
      osc.stop(now + tone.start + tone.dur + 0.02)
    }
  })
}
