import type { JobRequest, StoredAccount, SkillProfile } from './storage'
import { normalizePhone } from './storage'
import { kvConfigured, kvGetJson, kvSetJson } from './kv-rest'
import { redisGetJson, redisSetJson, redisUrlConfigured } from './redis-url'

const LEGACY_STORE_KEY = 'sn:marketplace'
const ACCOUNT_INDEX = 'sn:index:accounts'
const PROFILE_INDEX = 'sn:index:profiles'
const REQUEST_INDEX = 'sn:index:requests'

export type CloudMarketplace = {
  accounts: Record<string, StoredAccount>
  profiles: Record<string, SkillProfile>
  requests: Record<string, JobRequest>
  updatedAt: string
}

function emptyStore(): CloudMarketplace {
  return {
    accounts: {},
    profiles: {},
    requests: {},
    updatedAt: new Date().toISOString(),
  }
}

function accountKey(phone: string) {
  return `sn:account:${phone}`
}

function profileKey(id: string) {
  return `sn:profile:${id}`
}

function requestKey(id: string) {
  return `sn:request:${id}`
}

export function isCloudStoreConfigured(): boolean {
  return kvConfigured() || redisUrlConfigured()
}

async function cloudGetJson<T>(key: string): Promise<T | null> {
  if (kvConfigured()) return kvGetJson<T>(key)
  if (redisUrlConfigured()) return redisGetJson<T>(key)
  return null
}

async function cloudSetJson(key: string, value: unknown): Promise<boolean> {
  if (kvConfigured()) return kvSetJson(key, value)
  if (redisUrlConfigured()) return redisSetJson(key, value)
  return false
}

async function addToIndex(indexKey: string, id: string) {
  const ids = (await cloudGetJson<string[]>(indexKey)) || []
  if (ids.includes(id)) return
  ids.push(id)
  await cloudSetJson(indexKey, ids)
}

let legacyMigrated = false

async function migrateLegacyStore() {
  if (legacyMigrated || !isCloudStoreConfigured()) return
  legacyMigrated = true
  const legacy = await cloudGetJson<CloudMarketplace>(LEGACY_STORE_KEY)
  if (!legacy) return
  for (const account of Object.values(legacy.accounts || {})) {
    await cloudUpsertAccount(account)
  }
  for (const profile of Object.values(legacy.profiles || {})) {
    await cloudUpsertProfile(profile)
  }
  for (const request of Object.values(legacy.requests || {})) {
    await cloudUpsertRequest(request)
  }
}

async function loadIndexedRecords<T>(
  indexKey: string,
  recordKey: (id: string) => string,
): Promise<Record<string, T>> {
  const ids = (await cloudGetJson<string[]>(indexKey)) || []
  const out: Record<string, T> = {}
  for (const id of ids) {
    const item = await cloudGetJson<T>(recordKey(id))
    if (item) out[id] = item
  }
  return out
}

export async function readCloudMarketplace(): Promise<CloudMarketplace> {
  if (!isCloudStoreConfigured()) return emptyStore()
  await migrateLegacyStore()

  const accounts = await loadIndexedRecords<StoredAccount>(
    ACCOUNT_INDEX,
    accountKey,
  )
  const profiles = await loadIndexedRecords<SkillProfile>(
    PROFILE_INDEX,
    profileKey,
  )
  const requests = await loadIndexedRecords<JobRequest>(
    REQUEST_INDEX,
    requestKey,
  )

  return {
    accounts,
    profiles,
    requests,
    updatedAt: new Date().toISOString(),
  }
}

export async function cloudUpsertAccount(account: StoredAccount): Promise<boolean> {
  const key = normalizePhone(account.phone)
  if (!key) return false
  const ok = await cloudSetJson(accountKey(key), account)
  if (ok) await addToIndex(ACCOUNT_INDEX, key)
  return ok
}

export async function cloudUpsertProfile(profile: SkillProfile): Promise<boolean> {
  if (!profile.id) return false
  const ok = await cloudSetJson(profileKey(profile.id), profile)
  if (ok) await addToIndex(PROFILE_INDEX, profile.id)
  return ok
}

export async function cloudUpsertRequest(request: JobRequest): Promise<boolean> {
  if (!request.id) return false
  const ok = await cloudSetJson(requestKey(request.id), request)
  if (ok) await addToIndex(REQUEST_INDEX, request.id)
  return ok
}

export function cloudToArrays(store: CloudMarketplace) {
  return {
    accounts: Object.values(store.accounts),
    profiles: Object.values(store.profiles),
    requests: Object.values(store.requests),
  }
}
