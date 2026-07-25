export type AvailabilityType = 'job' | 'hourly' | 'daily' | 'full-time'

export type Gender = 'male' | 'female'

export const genderLabels: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
}

export type SkillRates = Partial<Record<AvailabilityType, string>>

export type SkillProfile = {
  id: string
  skillId: string
  name: string
  gender: Gender
  education: string
  experience: string
  phone: string
  address: string
  city: string
  pinCode: string
  latitude?: number
  longitude?: number
  availability: AvailabilityType[]
  rates: SkillRates
  about: string
  createdAt: string
}

const STORAGE_KEY = 'swayam-krushi-profiles'

/** Display order: Per job, Hr, Daily, Full time */
export const hireOptions: AvailabilityType[] = [
  'job',
  'hourly',
  'daily',
  'full-time',
]

export const availabilityLabels: Record<AvailabilityType, string> = {
  job: 'Per job',
  hourly: 'Hourly',
  daily: 'Daily',
  'full-time': 'Full time',
}

export type ProfileSort =
  | 'nearest'
  | 'cost-asc'
  | 'cost-desc'
  | 'exp-desc'
  | 'exp-asc'
  | 'newest'

export const educationOptions = [
  '10th',
  'PUC',
  'Diploma',
  'Degree',
  'Post Graduation',
  'Uneducated',
] as const

export { getEducationOptions, commonEducationOptions } from '../data/educationBySkill'

export const experienceOptions = [
  '0 Year',
  '1 Year',
  '2 Years',
  '3 Years',
  '4 Years',
  '5 Years',
  '6 Years',
  '7 Years',
  '8 Years',
  '9 Years',
  '10+',
] as const

export function parseExperienceYears(experience: string): number {
  if (experience.trim() === '10+') return 10
  const match = experience.replace(/,/g, '').match(/(\d+(\.\d+)?)/)
  return match ? Number(match[1]) : -1
}

export function parseRateAmount(rate: string | undefined): number {
  if (!rate) return Number.POSITIVE_INFINITY
  const match = rate.replace(/,/g, '').match(/(\d+(\.\d+)?)/)
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY
}

/** Lowest listed rate on a profile (for cost sorting) */
export function getLowestRate(profile: SkillProfile): number {
  const amounts = hireOptions
    .filter((t) => profile.availability.includes(t))
    .map((t) => parseRateAmount(profile.rates[t]))
    .filter((n) => Number.isFinite(n))
  if (amounts.length === 0) return Number.POSITIVE_INFINITY
  return Math.min(...amounts)
}

export function sortProfiles(
  profiles: SkillProfile[],
  sort: ProfileSort,
): SkillProfile[] {
  const list = [...profiles]
  switch (sort) {
    case 'nearest':
      return list
    case 'cost-asc':
      return list.sort((a, b) => getLowestRate(a) - getLowestRate(b))
    case 'cost-desc':
      return list.sort((a, b) => getLowestRate(b) - getLowestRate(a))
    case 'exp-desc':
      return list.sort(
        (a, b) =>
          parseExperienceYears(b.experience) - parseExperienceYears(a.experience),
      )
    case 'exp-asc':
      return list.sort(
        (a, b) =>
          parseExperienceYears(a.experience) - parseExperienceYears(b.experience),
      )
    case 'newest':
    default:
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
}

function seedProfiles(): SkillProfile[] {
  return [
    {
      id: 'seed-1',
      skillId: 'driver',
      name: 'Ramesh Kumar',
      gender: 'male',
      education: 'Valid DL — LMV',
      experience: '8 Years',
      phone: '98765 43210',
      address: 'Near City Market',
      city: 'Bengaluru',
      pinCode: '560001',
      availability: ['job', 'hourly'],
      rates: { job: '₹800', hourly: '₹250' },
      about: 'Safe city driver. Available Sat–Sun and evenings.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'seed-2',
      skillId: 'nurse',
      name: 'Anita Sharma',
      gender: 'female',
      education: 'GNM',
      experience: '6 Years',
      phone: '98111 22334',
      address: 'MG Road area',
      city: 'Bengaluru',
      pinCode: '560001',
      availability: ['hourly', 'daily'],
      rates: { hourly: '₹400', daily: '₹2500' },
      about: 'Hospital nurse available 6–8 PM for home care.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'seed-3',
      skillId: 'cook',
      name: 'Lakshmi Devi',
      gender: 'female',
      education: 'Self-taught',
      experience: '10+',
      phone: '99000 11223',
      address: 'Jayanagar',
      city: 'Bengaluru',
      pinCode: '560041',
      availability: ['job', 'daily'],
      rates: { job: '₹800', daily: '₹1500' },
      about: 'South Indian & North Indian home cooking.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'seed-4',
      skillId: 'employee',
      name: 'Vikram Rao',
      gender: 'male',
      education: 'Degree',
      experience: '4 Years',
      phone: '98888 77665',
      address: 'Indiranagar',
      city: 'Bengaluru',
      pinCode: '560038',
      availability: ['job', 'hourly'],
      rates: { job: '₹1500', hourly: '₹300' },
      about: 'Available for part-time office and clerical help.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'seed-5',
      skillId: 'priest',
      name: 'Pandit Suresh Joshi',
      gender: 'male',
      education: 'Vedic studies',
      experience: '10+',
      phone: '97654 32109',
      address: 'Temple Road',
      city: 'Bengaluru',
      pinCode: '560001',
      availability: ['job'],
      rates: { job: '₹1500' },
      about: 'Home puja, griha pravesh, and festival rituals.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'seed-6',
      skillId: 'carpenter',
      name: 'Suresh Naik',
      gender: 'male',
      education: 'ITI Carpenter',
      experience: '10+',
      phone: '98765 10001',
      address: 'Near Bus Stand',
      city: 'Bengaluru',
      pinCode: '560001',
      availability: ['job', 'daily'],
      rates: { job: '₹1200', daily: '₹900' },
      about: 'Furniture repair, shelves, and door fittings.',
      createdAt: new Date().toISOString(),
    },
  ]
}

function parseGender(raw: unknown): Gender {
  return raw === 'female' ? 'female' : 'male'
}

function normalizeProfile(raw: Record<string, unknown>): SkillProfile {
  const availability = (Array.isArray(raw.availability) ? raw.availability : [])
    .filter((a): a is AvailabilityType =>
      hireOptions.includes(a as AvailabilityType),
    )

  let rates: SkillRates =
    raw.rates && typeof raw.rates === 'object'
      ? (raw.rates as SkillRates)
      : {}

  // Migrate older single rateNote into first availability slot
  if (
    Object.keys(rates).length === 0 &&
    typeof raw.rateNote === 'string' &&
    raw.rateNote &&
    availability[0]
  ) {
    rates = { [availability[0]]: raw.rateNote }
  }

  return {
    id: String(raw.id || `p-${Date.now()}`),
    skillId: String(raw.skillId || ''),
    name: String(raw.name || ''),
    gender: parseGender(raw.gender),
    education: String(raw.education || ''),
    experience: String(raw.experience || ''),
    phone: String(raw.phone || ''),
    address: String(raw.address || ''),
    city: String(raw.city || ''),
    pinCode: String(raw.pinCode || ''),
    latitude:
      typeof raw.latitude === 'number'
        ? raw.latitude
        : Number(raw.latitude) || undefined,
    longitude:
      typeof raw.longitude === 'number'
        ? raw.longitude
        : Number(raw.longitude) || undefined,
    availability,
    rates,
    about: String(raw.about || ''),
    createdAt: String(raw.createdAt || new Date().toISOString()),
  }
}

export function getProfiles(): SkillProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seeded = seedProfiles()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
      return seeded
    }
    const parsed = JSON.parse(raw) as Record<string, unknown>[]
    return parsed.map((p) => normalizeProfile(p))
  } catch {
    return seedProfiles()
  }
}

export function saveProfile(
  profile: Omit<SkillProfile, 'id' | 'createdAt'>,
): SkillProfile {
  const profiles = getProfiles()
  const newProfile: SkillProfile = {
    ...profile,
    id: `p-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  profiles.unshift(newProfile)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
  rememberOwnedProfile(newProfile.id)
  enterAsRole(
    { name: newProfile.name, phone: newProfile.phone },
    'seeker',
  )
  if (typeof window !== 'undefined') {
    import('./cloud-sync').then(({ syncToCloud }) => {
      syncToCloud({ type: 'profile', data: newProfile })
    })
  }
  return newProfile
}

function writeProfiles(profiles: SkillProfile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
}

export function deleteProfile(id: string): boolean {
  const profiles = getProfiles().filter((p) => p.id !== id)
  writeProfiles(profiles)
  const owned = getOwnedProfileIds().filter((oid) => oid !== id)
  localStorage.setItem(OWNED_KEY, JSON.stringify(owned))
  // Remove requests aimed at this listing
  writeRequests(getRequests().filter((r) => r.profileId !== id))
  return true
}

/** Delete all listings for a job seeker (by phone) and related requests */
export function deleteJobSeekerByPhone(phone: string): number {
  const key = normalizePhone(phone)
  const profiles = getProfiles()
  const removeIds = new Set(
    profiles.filter((p) => normalizePhone(p.phone) === key).map((p) => p.id),
  )
  if (removeIds.size === 0) return 0
  writeProfiles(profiles.filter((p) => !removeIds.has(p.id)))
  const owned = getOwnedProfileIds().filter((id) => !removeIds.has(id))
  localStorage.setItem(OWNED_KEY, JSON.stringify(owned))
  writeRequests(getRequests().filter((r) => !removeIds.has(r.profileId)))
  return removeIds.size
}

export function deleteRequest(id: string): boolean {
  const next = getRequests().filter((r) => r.id !== id)
  if (next.length === getRequests().length) return false
  writeRequests(next)
  return true
}

/** Delete all requests from a job giver (by phone) */
export function deleteJobGiverByPhone(phone: string): number {
  const key = normalizePhone(phone)
  const before = getRequests()
  const next = before.filter((r) => normalizePhone(r.requesterPhone) !== key)
  const removed = before.length - next.length
  writeRequests(next)
  return removed
}

/** Wipe marketplace data in this browser (profiles + requests) */
export function clearAllMarketplaceData() {
  writeProfiles([])
  writeRequests([])
  localStorage.setItem(OWNED_KEY, JSON.stringify([]))
  localStorage.removeItem(SENDER_KEY)
  localStorage.removeItem(PAID_PACKS_KEY)
  localStorage.removeItem(ACCOUNTS_KEY)
  clearSession()
}

export function restoreSampleProfiles() {
  writeProfiles(seedProfiles())
}

/** Exact pin match, or all profiles when pin is empty. */
export function searchByPin(skillId: string, pinCode: string): SkillProfile[] {
  const all = getProfiles().filter((p) => p.skillId === skillId)
  const pin = pinCode.trim()
  if (!pin) return all
  return all.filter((p) => p.pinCode === pin)
}

/** Profiles in a city (case-insensitive; partial match). */
export function searchByCity(skillId: string, city: string): SkillProfile[] {
  const all = getProfiles().filter((p) => p.skillId === skillId)
  const q = city.trim().toLowerCase()
  if (!q) return all
  return all.filter((p) => p.city.toLowerCase().includes(q))
}

/**
 * Profiles nearest to a pin / GPS point.
 * Prefer distance when coordinates exist; otherwise same postal area (first 3 digits).
 */
export function searchNearbyProfiles(
  skillId: string,
  pinCode: string,
  origin?: { latitude: number; longitude: number },
): SkillProfile[] {
  const all = getProfiles().filter((p) => p.skillId === skillId)
  const pin = pinCode.trim()

  if (origin) {
    return [...all].sort((a, b) => {
      const da =
        a.latitude != null && a.longitude != null
          ? Math.hypot(a.latitude - origin.latitude, a.longitude - origin.longitude)
          : Number.POSITIVE_INFINITY
      const db =
        b.latitude != null && b.longitude != null
          ? Math.hypot(b.latitude - origin.latitude, b.longitude - origin.longitude)
          : Number.POSITIVE_INFINITY
      if (da !== db) return da - db
      if (!pin) return 0
      const pinNum = Number(pin)
      return (
        Math.abs(Number(a.pinCode) - pinNum) - Math.abs(Number(b.pinCode) - pinNum)
      )
    })
  }

  if (!pin || pin.length < 3) return all

  const area = pin.slice(0, 3)
  const nearby = all.filter((p) => p.pinCode.startsWith(area))
  const list = nearby.length ? nearby : all
  const pinNum = Number(pin)
  return [...list].sort(
    (a, b) =>
      Math.abs(Number(a.pinCode) - pinNum) - Math.abs(Number(b.pinCode) - pinNum),
  )
}

export function formatRates(profile: SkillProfile): string {
  return hireOptions
    .filter((type) => profile.availability.includes(type) && profile.rates[type])
    .map((type) => `${availabilityLabels[type]} ${profile.rates[type]}`)
    .join(' · ')
}

/* —— Job requests (phone shared only after accept) —— */

export type RequestStatus = 'pending' | 'accepted' | 'declined'

export type JobRequest = {
  id: string
  profileId: string
  skillId: string
  hireType: AvailabilityType | ''
  requesterName: string
  requesterPhone: string
  requesterGender?: Gender
  note: string
  status: RequestStatus
  createdAt: string
  /** Captured when help request is sent (for commute after accept) */
  requesterLatitude?: number
  requesterLongitude?: number
  /** Area / locality from GPS when request was sent */
  requesterAddress?: string
  requesterCity?: string
  requesterPinCode?: string
}

const REQUESTS_KEY = 'swayam-krushi-requests'
const OWNED_KEY = 'swayam-krushi-owned-profiles'
const SENDER_KEY = 'swayam-krushi-sender'
const SESSION_KEY = 'swayam-krushi-login'
const ACCOUNTS_KEY = 'swayam-krushi-accounts'

/** Free help requests an "I need help" user can send per calendar day */
export const FREE_REQUESTS_PER_DAY = 3
/** Extra requests unlocked by each ₹1 daily top-up */
export const PAID_REQUESTS_PER_PACK = 3
/** Price in rupees for one extra pack (same day) */
export const EXTRA_PACK_PRICE_INR = 1

const PAID_PACKS_KEY = 'swayam-krushi-paid-packs'

export type PaidPackRecord = {
  id: string
  phone: string
  day: string
  amountInr: number
  extraRequests: number
  paymentId: string
  mode: 'razorpay' | 'demo'
  createdAt: string
}

function getPaidPacks(): PaidPackRecord[] {
  try {
    const raw = localStorage.getItem(PAID_PACKS_KEY)
    if (!raw) return []
    const list = JSON.parse(raw) as PaidPackRecord[]
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function writePaidPacks(packs: PaidPackRecord[]) {
  localStorage.setItem(PAID_PACKS_KEY, JSON.stringify(packs))
}

export function countPaidExtraRequestsToday(requesterPhone: string): number {
  const phone = normalizePhone(requesterPhone)
  if (!phone) return 0
  const today = localDayKey()
  return getPaidPacks()
    .filter((p) => normalizePhone(p.phone) === phone && p.day === today)
    .reduce((sum, p) => sum + (p.extraRequests || PAID_REQUESTS_PER_PACK), 0)
}

export function recordPaidRequestPack(input: {
  phone: string
  paymentId: string
  mode: 'razorpay' | 'demo'
  amountInr?: number
}): PaidPackRecord {
  const phone = normalizePhone(input.phone)
  const pack: PaidPackRecord = {
    id: `pack-${Date.now()}`,
    phone,
    day: localDayKey(),
    amountInr: input.amountInr ?? EXTRA_PACK_PRICE_INR,
    extraRequests: PAID_REQUESTS_PER_PACK,
    paymentId: input.paymentId,
    mode: input.mode,
    createdAt: new Date().toISOString(),
  }
  const packs = getPaidPacks()
  packs.unshift(pack)
  writePaidPacks(packs)
  return pack
}

export function getPaidPacksForAdmin(): PaidPackRecord[] {
  return getPaidPacks()
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10)
}

function localDayKey(iso = new Date().toISOString()): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function countRequestsToday(requesterPhone: string): number {
  const phone = normalizePhone(requesterPhone)
  if (!phone) return 0
  const today = localDayKey()
  return getRequests().filter(
    (r) =>
      normalizePhone(r.requesterPhone) === phone &&
      localDayKey(r.createdAt) === today,
  ).length
}

export function getDailyRequestQuota(requesterPhone: string): {
  used: number
  limit: number
  remaining: number
  freeLimit: number
  paidExtra: number
} {
  const used = countRequestsToday(requesterPhone)
  const paidExtra = countPaidExtraRequestsToday(requesterPhone)
  const freeLimit = FREE_REQUESTS_PER_DAY
  const limit = freeLimit + paidExtra
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    freeLimit,
    paidExtra,
  }
}

export type CreateRequestResult =
  | { ok: true; request: JobRequest; remaining: number }
  | {
      ok: false
      reason: 'limit' | 'invalid'
      used: number
      limit: number
      remaining: number
    }

export type SenderIdentity = {
  name: string
  phone: string
  gender?: Gender
}

export type UserRole = 'seeker' | 'giver'

/** Persisted signup accounts (by phone) — survives logout */
export type StoredAccount = {
  name: string
  phone: string
  gender?: Gender
  roles: UserRole[]
  updatedAt: string
}

function getAccountsMap(): Record<string, StoredAccount> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, StoredAccount>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeAccountsMap(map: Record<string, StoredAccount>) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(map))
}

export function getAllAccounts(): StoredAccount[] {
  ensureAccountFromSender()
  return Object.values(getAccountsMap())
}

export function getAccountByPhone(phone: string): StoredAccount | null {
  const key = normalizePhone(phone)
  if (!key) return null
  const map = getAccountsMap()
  return map[key] || null
}

export function upsertAccount(input: {
  name: string
  phone: string
  gender?: Gender
  roles?: UserRole[]
}): StoredAccount {
  const key = normalizePhone(input.phone)
  const map = getAccountsMap()
  const prev = map[key]
  const roles = [
    ...new Set([
      ...(prev?.roles || []),
      ...(input.roles || []),
    ]),
  ] as UserRole[]
  const next: StoredAccount = {
    name: input.name.trim() || prev?.name || 'User',
    phone: input.phone.trim() || prev?.phone || key,
    gender: input.gender ?? prev?.gender,
    roles: roles.length ? roles : (['seeker'] as UserRole[]),
    updatedAt: new Date().toISOString(),
  }
  map[key] = next
  writeAccountsMap(map)
  if (typeof window !== 'undefined') {
    import('./cloud-sync').then(({ syncToCloud }) => {
      syncToCloud({ type: 'account', data: next })
    })
  }
  return next
}

/** Seed last sender into accounts map (one-time migration for older sessions). */
function ensureAccountFromSender() {
  const sender = getSenderIdentity()
  if (!sender) return
  const key = normalizePhone(sender.phone)
  if (!key || getAccountByPhone(key)) return
  upsertAccount({
    name: sender.name,
    phone: sender.phone,
    gender: sender.gender,
    roles: ['seeker', 'giver'],
  })
}

export function getOwnedProfileIds(): string[] {
  try {
    const raw = localStorage.getItem(OWNED_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function rememberOwnedProfile(profileId: string) {
  const ids = getOwnedProfileIds()
  if (!ids.includes(profileId)) {
    ids.unshift(profileId)
    localStorage.setItem(OWNED_KEY, JSON.stringify(ids))
  }
}

export function getSenderIdentity(): SenderIdentity | null {
  try {
    const raw = localStorage.getItem(SENDER_KEY)
    return raw ? (JSON.parse(raw) as SenderIdentity) : null
  } catch {
    return null
  }
}

export function saveSenderIdentity(identity: SenderIdentity) {
  localStorage.setItem(SENDER_KEY, JSON.stringify(identity))
}

export type SessionUser = {
  name: string
  phone: string
  /** Current workspace: job seeker or job giver */
  activeRole: UserRole
  /** Roles this person has used / can open */
  roles: UserRole[]
}

const sessionListeners = new Set<() => void>()

function emitSessionChange() {
  sessionListeners.forEach((listener) => listener())
}

export function subscribeSession(listener: () => void) {
  sessionListeners.add(listener)
  return () => {
    sessionListeners.delete(listener)
  }
}

export function getSessionRaw(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

function normalizeSession(raw: Partial<SessionUser> & { name: string; phone: string }): SessionUser {
  const roles = Array.isArray(raw.roles) && raw.roles.length
    ? ([...new Set(raw.roles.filter((r) => r === 'seeker' || r === 'giver'))] as UserRole[])
    : (['seeker'] as UserRole[])
  const activeRole =
    raw.activeRole === 'giver' || raw.activeRole === 'seeker'
      ? raw.activeRole
      : roles[0]
  if (!roles.includes(activeRole)) roles.push(activeRole)
  return {
    name: raw.name.trim(),
    phone: raw.phone.trim(),
    activeRole,
    roles,
  }
}

export function getSession(): SessionUser | null {
  try {
    const raw = getSessionRaw()
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<SessionUser> & {
      name?: string
      phone?: string
    }
    if (!parsed.name || !parsed.phone) return null
    return normalizeSession(parsed as Partial<SessionUser> & { name: string; phone: string })
  } catch {
    return null
  }
}

export function setSession(user: SessionUser) {
  const clean = normalizeSession(user)
  localStorage.setItem(SESSION_KEY, JSON.stringify(clean))
  saveSenderIdentity({ name: clean.name, phone: clean.phone })
  upsertAccount({
    name: clean.name,
    phone: clean.phone,
    roles: clean.roles,
  })
  if (typeof window !== 'undefined') {
    import('./cloud-sync').then(({ syncMyDataToCloud }) => {
      syncMyDataToCloud()
    })
  }
  emitSessionChange()
}

/** Log in / stay logged in and open a role workspace (same person can use both). */
export function enterAsRole(
  identity: { name: string; phone: string },
  role: UserRole,
): SessionUser {
  const existing = getSession()
  const samePerson =
    existing &&
    normalizePhone(existing.phone) === normalizePhone(identity.phone)

  const roles = samePerson
    ? ([...new Set([...existing.roles, role])] as UserRole[])
    : ([role] as UserRole[])

  const next: SessionUser = {
    name: identity.name.trim() || existing?.name || '',
    phone: identity.phone.trim(),
    activeRole: role,
    roles,
  }
  setSession(next)
  return next
}

export function switchRole(role: UserRole): SessionUser | null {
  const session = getSession()
  if (!session) return null
  const roles = [...new Set([...session.roles, role])] as UserRole[]
  const next = { ...session, activeRole: role, roles }
  setSession(next)
  return next
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  emitSessionChange()
}

export function getProfilesByPhone(phone: string): SkillProfile[] {
  const key = normalizePhone(phone)
  if (!key) return []
  return getProfiles().filter((p) => normalizePhone(p.phone) === key)
}

/** Skills already listed by the logged-in user (by phone + owned ids) */
export function getMyProfiles(): SkillProfile[] {
  const session = getSession()
  if (!session) return []
  const byPhone = getProfilesByPhone(session.phone)
  const ownedIds = new Set(getOwnedProfileIds())
  const owned = getProfiles().filter((p) => ownedIds.has(p.id))
  const map = new Map<string, SkillProfile>()
  for (const p of [...byPhone, ...owned]) map.set(p.id, p)
  return Array.from(map.values()).sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt),
  )
}

export function getMySkillIds(): string[] {
  return [...new Set(getMyProfiles().map((p) => p.skillId))]
}

export function detectRolesForPhone(phone: string): UserRole[] {
  const key = normalizePhone(phone)
  const roles: UserRole[] = []
  if (getProfilesByPhone(key).length > 0) roles.push('seeker')
  const hasOutgoing = getRequests().some(
    (r) => normalizePhone(r.requesterPhone) === key,
  )
  const sender = getSenderIdentity()
  if (hasOutgoing || (sender && normalizePhone(sender.phone) === key)) {
    roles.push('giver')
  }
  return roles
}

export type LoginResult =
  | { ok: true; user: SessionUser; profileCount: number }
  | { ok: false; message: string }

function accountExistsForPhone(phone: string): boolean {
  const key = normalizePhone(phone)
  if (getAccountByPhone(key)) return true
  if (getProfilesByPhone(key).length > 0) return true
  if (detectRolesForPhone(key).length > 0) return true
  const sender = getSenderIdentity()
  return Boolean(sender && normalizePhone(sender.phone) === key)
}

/** New account (sign up) for a chosen role — then user can enter the app. */
export function registerWithPhone(input: {
  name: string
  phone: string
  gender: Gender
  role: UserRole
}): LoginResult {
  const key = normalizePhone(input.phone)
  if (key.length !== 10) {
    return { ok: false, message: 'Enter a valid 10-digit mobile number.' }
  }
  const cleanName = input.name.trim()
  if (!cleanName) {
    return { ok: false, message: 'Please enter your name.' }
  }
  if (input.gender !== 'male' && input.gender !== 'female') {
    return { ok: false, message: 'Please select Male or Female.' }
  }
  if (accountExistsForPhone(key)) {
    return {
      ok: false,
      message: 'An account already exists for this number. Please log in.',
    }
  }

  const displayPhone = input.phone.trim()
  saveSenderIdentity({
    name: cleanName,
    phone: displayPhone,
    gender: input.gender,
  })
  upsertAccount({
    name: cleanName,
    phone: displayPhone,
    gender: input.gender,
    roles: [input.role],
  })
  const user = enterAsRole({ name: cleanName, phone: displayPhone }, input.role)
  saveSenderIdentity({
    name: cleanName,
    phone: displayPhone,
    gender: input.gender,
  })
  return { ok: true, user, profileCount: getProfilesByPhone(key).length }
}

/** Login with mobile; optional role picks the workspace (seeker / giver). */
export function loginWithPhone(
  phone: string,
  preferredRole?: UserRole,
): LoginResult {
  ensureAccountFromSender()
  const key = normalizePhone(phone)
  if (key.length !== 10) {
    return { ok: false, message: 'Enter a valid 10-digit mobile number.' }
  }

  const account = getAccountByPhone(key)
  const profiles = getProfilesByPhone(key)
  const detected = detectRolesForPhone(key)
  if (
    !account &&
    detected.length === 0 &&
    profiles.length === 0
  ) {
    const sender = getSenderIdentity()
    if (!(sender && normalizePhone(sender.phone) === key)) {
      return {
        ok: false,
        message:
          'No account found for this number. Tap Sign up to create a profile.',
      }
    }
  }

  let name = account?.name || ''
  let displayPhone = account?.phone || phone
  if (profiles.length > 0) {
    name = name || profiles[0].name
    displayPhone = profiles[0].phone
    for (const p of profiles) rememberOwnedProfile(p.id)
  } else {
    const sender = getSenderIdentity()
    if (sender && normalizePhone(sender.phone) === key) {
      name = name || sender.name
      displayPhone = sender.phone
    }
  }

  const outgoing = getRequests().filter(
    (r) => normalizePhone(r.requesterPhone) === key,
  )
  if (!name && outgoing[0]) name = outgoing[0].requesterName

  const roles =
    account?.roles?.length
      ? account.roles
      : detected.length > 0
        ? detected
        : preferredRole
          ? [preferredRole]
          : (['seeker'] as UserRole[])

  const activeRole =
    preferredRole && roles.includes(preferredRole)
      ? preferredRole
      : preferredRole && !roles.includes(preferredRole)
        ? preferredRole
        : roles.includes('seeker')
          ? 'seeker'
          : roles[0]

  const finalRoles = [...new Set([...roles, activeRole])] as UserRole[]
  const user: SessionUser = {
    name: name || 'User',
    phone: displayPhone,
    activeRole,
    roles: finalRoles,
  }
  setSession(user)
  if (account?.gender) {
    saveSenderIdentity({
      name: user.name,
      phone: user.phone,
      gender: account.gender,
    })
  }
  return { ok: true, user, profileCount: profiles.length }
}

export function getRequests(): JobRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as JobRequest[]
  } catch {
    return []
  }
}

function writeRequests(requests: JobRequest[]) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests))
  try {
    window.dispatchEvent(new CustomEvent('sk-requests-changed'))
  } catch {
    /* ignore */
  }
}

export function createJobRequest(
  input: Omit<JobRequest, 'id' | 'status' | 'createdAt'>,
): CreateRequestResult {
  const phone = normalizePhone(input.requesterPhone)
  if (!phone || !input.requesterName.trim()) {
    return {
      ok: false,
      reason: 'invalid',
      used: 0,
      limit: FREE_REQUESTS_PER_DAY,
      remaining: FREE_REQUESTS_PER_DAY,
    }
  }

  const requests = getRequests()
  const existing = requests.find(
    (r) =>
      r.profileId === input.profileId &&
      normalizePhone(r.requesterPhone) === phone &&
      r.status === 'pending',
  )
  if (existing) {
    // Refresh location / note on an already-pending request
    const updated: JobRequest = {
      ...existing,
      requesterName: input.requesterName.trim() || existing.requesterName,
      requesterGender: input.requesterGender ?? existing.requesterGender,
      note: input.note ?? existing.note,
      hireType: input.hireType || existing.hireType,
      requesterLatitude: input.requesterLatitude ?? existing.requesterLatitude,
      requesterLongitude: input.requesterLongitude ?? existing.requesterLongitude,
      requesterAddress: input.requesterAddress ?? existing.requesterAddress,
      requesterCity: input.requesterCity ?? existing.requesterCity,
      requesterPinCode: input.requesterPinCode ?? existing.requesterPinCode,
    }
    const idx = requests.findIndex((r) => r.id === existing.id)
    requests[idx] = updated
    writeRequests(requests)
    if (typeof window !== 'undefined') {
      import('./cloud-sync').then(({ syncToCloud }) => {
        syncToCloud({ type: 'request', data: updated })
      })
    }
    const quota = getDailyRequestQuota(input.requesterPhone)
    return { ok: true, request: updated, remaining: quota.remaining }
  }

  const quota = getDailyRequestQuota(input.requesterPhone)
  if (quota.remaining <= 0) {
    return {
      ok: false,
      reason: 'limit',
      used: quota.used,
      limit: quota.limit,
      remaining: 0,
    }
  }

  const request: JobRequest = {
    ...input,
    id: `req-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  requests.unshift(request)
  writeRequests(requests)
  if (typeof window !== 'undefined') {
    import('./cloud-sync').then(({ syncToCloud }) => {
      syncToCloud({ type: 'request', data: request })
    })
  }
  return {
    ok: true,
    request,
    remaining: quota.remaining - 1,
  }
}

export function updateRequestLocation(
  id: string,
  location: {
    requesterLatitude?: number
    requesterLongitude?: number
    requesterAddress?: string
    requesterCity?: string
    requesterPinCode?: string
  },
): JobRequest | undefined {
  const requests = getRequests()
  const idx = requests.findIndex((r) => r.id === id)
  if (idx < 0) return undefined
  requests[idx] = { ...requests[idx], ...location }
  writeRequests(requests)
  return requests[idx]
}

export function updateRequestStatus(
  id: string,
  status: Exclude<RequestStatus, 'pending'>,
): JobRequest | undefined {
  const requests = getRequests()
  const idx = requests.findIndex((r) => r.id === id)
  if (idx < 0) return undefined
  requests[idx] = { ...requests[idx], status }
  writeRequests(requests)
  return requests[idx]
}

export function getRequestForProfile(
  profileId: string,
  requesterPhone?: string,
): JobRequest | undefined {
  const phone = (requesterPhone || getSenderIdentity()?.phone || '').replace(
    /\s/g,
    '',
  )
  const requests = getRequests().filter((r) => r.profileId === profileId)
  if (phone) {
    const mine = requests.find(
      (r) => r.requesterPhone.replace(/\s/g, '') === phone,
    )
    if (mine) return mine
  }
  return undefined
}

export function getProfileById(id: string): SkillProfile | undefined {
  return getProfiles().find((p) => p.id === id)
}

export function getRequestsForOwner(): JobRequest[] {
  const session = getSession()
  if (!session) return []
  const myIds = new Set(getMyProfiles().map((p) => p.id))
  return getRequests().filter((r) => myIds.has(r.profileId))
}

/** Requests sent by the logged-in job giver */
export function getMyOutgoingRequests(): JobRequest[] {
  const session = getSession()
  if (!session) return []
  const phone = normalizePhone(session.phone)
  return getRequests().filter(
    (r) => normalizePhone(r.requesterPhone) === phone,
  )
}

/* —— Admin dashboard aggregates —— */

export type AdminSeekerListing = {
  id: string
  skillId: string
  gender: Gender
  phone: string
  education: string
  experience: string
  address: string
  city: string
  pinCode: string
  latitude?: number
  longitude?: number
  availability: AvailabilityType[]
  rates: SkillRates
  about: string
  createdAt: string
}

export type AdminJobSeeker = {
  phone: string
  name: string
  gender?: Gender
  roles: UserRole[]
  skills: string[]
  cities: string[]
  pinCodes: string[]
  addresses: string[]
  education: string[]
  experience: string[]
  about: string[]
  listingCount: number
  listings: AdminSeekerListing[]
  latestAt: string
  registeredAt?: string
}

export type AdminGiverRequest = {
  id: string
  skillId: string
  profileId: string
  hireType: AvailabilityType | ''
  note: string
  status: RequestStatus
  createdAt: string
  seekerName: string
  seekerPhone: string
  requesterAddress?: string
  requesterCity?: string
  requesterPinCode?: string
  requesterLatitude?: number
  requesterLongitude?: number
}

export type AdminJobGiver = {
  phone: string
  name: string
  gender?: Gender
  roles: UserRole[]
  requestCount: number
  pending: number
  accepted: number
  declined: number
  skillsRequested: string[]
  hireTypes: string[]
  cities: string[]
  pinCodes: string[]
  addresses: string[]
  requests: AdminGiverRequest[]
  latestAt: string
  registeredAt?: string
}

export type AdminStats = {
  jobSeekers: number
  jobGivers: number
  listings: number
  requestsTotal: number
  requestsPending: number
  requestsAccepted: number
  requestsDeclined: number
}

export function buildAdminJobSeekers(
  profiles: SkillProfile[],
  accounts: StoredAccount[],
): AdminJobSeeker[] {
  const map = new Map<string, AdminJobSeeker>()
  for (const p of profiles) {
    const phone = normalizePhone(p.phone) || p.phone || p.id
    const listing: AdminSeekerListing = {
      id: p.id,
      skillId: p.skillId,
      gender: p.gender,
      phone: p.phone,
      education: p.education,
      experience: p.experience,
      address: p.address,
      city: p.city,
      pinCode: p.pinCode,
      latitude: p.latitude,
      longitude: p.longitude,
      availability: p.availability,
      rates: p.rates,
      about: p.about,
      createdAt: p.createdAt,
    }
    const row = map.get(phone)
    if (!row) {
      map.set(phone, {
        phone: p.phone || phone,
        name: p.name,
        gender: p.gender,
        roles: ['seeker'],
        skills: [p.skillId],
        cities: p.city ? [p.city] : [],
        pinCodes: p.pinCode ? [p.pinCode] : [],
        addresses: p.address ? [p.address] : [],
        education: p.education ? [p.education] : [],
        experience: p.experience ? [p.experience] : [],
        about: p.about ? [p.about] : [],
        listingCount: 1,
        listings: [listing],
        latestAt: p.createdAt,
      })
    } else {
      if (!row.skills.includes(p.skillId)) row.skills.push(p.skillId)
      if (p.city && !row.cities.includes(p.city)) row.cities.push(p.city)
      if (p.pinCode && !row.pinCodes.includes(p.pinCode)) {
        row.pinCodes.push(p.pinCode)
      }
      if (p.address && !row.addresses.includes(p.address)) {
        row.addresses.push(p.address)
      }
      if (p.education && !row.education.includes(p.education)) {
        row.education.push(p.education)
      }
      if (p.experience && !row.experience.includes(p.experience)) {
        row.experience.push(p.experience)
      }
      if (p.about && !row.about.includes(p.about)) row.about.push(p.about)
      row.listingCount += 1
      row.listings.push(listing)
      if (p.createdAt > row.latestAt) {
        row.latestAt = p.createdAt
        row.name = p.name
        row.phone = p.phone || row.phone
        row.gender = p.gender
      }
    }
  }

  for (const account of accounts) {
    const key = normalizePhone(account.phone)
    if (!key || !account.roles.includes('seeker')) continue
    const row = map.get(key)
    if (row) {
      row.roles = [...new Set([...row.roles, ...account.roles])]
      row.gender = row.gender ?? account.gender
      row.name = row.name || account.name
      row.registeredAt = account.updatedAt
      continue
    }
    map.set(key, {
      phone: account.phone,
      name: account.name,
      gender: account.gender,
      roles: account.roles,
      skills: [],
      cities: [],
      pinCodes: [],
      addresses: [],
      education: [],
      experience: [],
      about: [],
      listingCount: 0,
      listings: [],
      latestAt: account.updatedAt,
      registeredAt: account.updatedAt,
    })
  }

  return Array.from(map.values()).sort((a, b) =>
    b.latestAt.localeCompare(a.latestAt),
  )
}

export function getAdminJobSeekers(): AdminJobSeeker[] {
  return buildAdminJobSeekers(getProfiles(), getAllAccounts())
}

export function buildAdminJobGivers(
  requests: JobRequest[],
  accounts: StoredAccount[],
): AdminJobGiver[] {
  const map = new Map<string, AdminJobGiver>()
  for (const r of requests) {
    const phone = normalizePhone(r.requesterPhone) || r.requesterPhone
    const profile = getProfileById(r.profileId)
    const detail: AdminGiverRequest = {
      id: r.id,
      skillId: r.skillId,
      profileId: r.profileId,
      hireType: r.hireType,
      note: r.note,
      status: r.status,
      createdAt: r.createdAt,
      seekerName: profile?.name || '—',
      seekerPhone: profile?.phone || '—',
      requesterAddress: r.requesterAddress,
      requesterCity: r.requesterCity,
      requesterPinCode: r.requesterPinCode,
      requesterLatitude: r.requesterLatitude,
      requesterLongitude: r.requesterLongitude,
    }
    const row = map.get(phone)
    if (!row) {
      map.set(phone, {
        phone: r.requesterPhone,
        name: r.requesterName,
        gender: r.requesterGender,
        roles: ['giver'],
        requestCount: 1,
        pending: r.status === 'pending' ? 1 : 0,
        accepted: r.status === 'accepted' ? 1 : 0,
        declined: r.status === 'declined' ? 1 : 0,
        skillsRequested: [r.skillId],
        hireTypes: r.hireType ? [r.hireType] : [],
        cities: r.requesterCity ? [r.requesterCity] : [],
        pinCodes: r.requesterPinCode ? [r.requesterPinCode] : [],
        addresses: r.requesterAddress ? [r.requesterAddress] : [],
        requests: [detail],
        latestAt: r.createdAt,
      })
    } else {
      row.requestCount += 1
      if (r.status === 'pending') row.pending += 1
      if (r.status === 'accepted') row.accepted += 1
      if (r.status === 'declined') row.declined += 1
      if (!row.skillsRequested.includes(r.skillId)) {
        row.skillsRequested.push(r.skillId)
      }
      if (r.hireType && !row.hireTypes.includes(r.hireType)) {
        row.hireTypes.push(r.hireType)
      }
      if (r.requesterCity && !row.cities.includes(r.requesterCity)) {
        row.cities.push(r.requesterCity)
      }
      if (r.requesterPinCode && !row.pinCodes.includes(r.requesterPinCode)) {
        row.pinCodes.push(r.requesterPinCode)
      }
      if (r.requesterAddress && !row.addresses.includes(r.requesterAddress)) {
        row.addresses.push(r.requesterAddress)
      }
      row.requests.push(detail)
      if (r.createdAt > row.latestAt) {
        row.latestAt = r.createdAt
        row.name = r.requesterName
        row.phone = r.requesterPhone
        row.gender = r.requesterGender ?? row.gender
      }
    }
  }

  for (const account of accounts) {
    const key = normalizePhone(account.phone)
    if (!key || !account.roles.includes('giver')) continue
    const row = map.get(key)
    if (row) {
      row.roles = [...new Set([...row.roles, ...account.roles])]
      row.gender = row.gender ?? account.gender
      row.name = row.name || account.name
      row.registeredAt = account.updatedAt
      continue
    }
    map.set(key, {
      phone: account.phone,
      name: account.name,
      gender: account.gender,
      roles: account.roles,
      requestCount: 0,
      pending: 0,
      accepted: 0,
      declined: 0,
      skillsRequested: [],
      hireTypes: [],
      cities: [],
      pinCodes: [],
      addresses: [],
      requests: [],
      latestAt: account.updatedAt,
      registeredAt: account.updatedAt,
    })
  }

  return Array.from(map.values()).sort((a, b) =>
    b.latestAt.localeCompare(a.latestAt),
  )
}

export function getAdminJobGivers(): AdminJobGiver[] {
  return buildAdminJobGivers(getRequests(), getAllAccounts())
}

export function buildAdminStats(
  profiles: SkillProfile[],
  requests: JobRequest[],
  seekers: AdminJobSeeker[],
  givers: AdminJobGiver[],
): AdminStats {
  return {
    jobSeekers: seekers.length,
    jobGivers: givers.length,
    listings: profiles.length,
    requestsTotal: requests.length,
    requestsPending: requests.filter((r) => r.status === 'pending').length,
    requestsAccepted: requests.filter((r) => r.status === 'accepted').length,
    requestsDeclined: requests.filter((r) => r.status === 'declined').length,
  }
}

export function getAdminStats(): AdminStats {
  const requests = getRequests()
  const seekers = getAdminJobSeekers()
  const givers = getAdminJobGivers()
  return buildAdminStats(getProfiles(), requests, seekers, givers)
}

/** Only this phone number can open the admin panel */
export const SUPER_ADMIN_PHONE = '9620115678'

export function isSuperAdminPhone(phone: string): boolean {
  return normalizePhone(phone) === SUPER_ADMIN_PHONE
}

export function isSuperAdminSession(
  session: SessionUser | null | undefined,
): boolean {
  if (!session) return false
  return isSuperAdminPhone(session.phone)
}

const ADMIN_KEY = 'swayam-krushi-admin'
const ADMIN_EVENT = 'sk-admin-changed'
/** Local demo password — replace with real auth before production */
export const ADMIN_DEMO_PASSWORD = 'admin123'

function emitAdminChanged() {
  try {
    window.dispatchEvent(new CustomEvent(ADMIN_EVENT))
  } catch {
    /* ignore */
  }
}

export function getAdminUnlockedRaw(): string | null {
  try {
    return localStorage.getItem(ADMIN_KEY)
  } catch {
    return null
  }
}

export function isAdminUnlocked(): boolean {
  return getAdminUnlockedRaw() === '1'
}

export function unlockAdmin(password: string): boolean {
  if (password.trim() === ADMIN_DEMO_PASSWORD) {
    localStorage.setItem(ADMIN_KEY, '1')
    emitAdminChanged()
    return true
  }
  return false
}

export function lockAdmin() {
  localStorage.removeItem(ADMIN_KEY)
  emitAdminChanged()
}

export function subscribeAdmin(listener: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === ADMIN_KEY || e.key === null) listener()
  }
  window.addEventListener('storage', onStorage)
  window.addEventListener(ADMIN_EVENT, listener)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(ADMIN_EVENT, listener)
  }
}
