import type { JobRequest, StoredAccount, SkillProfile } from './storage'
import { normalizePhone } from './storage'
import { kvConfigured, kvGetJson, kvSetJson } from './kv-rest'
import { redisGetJson, redisSetJson, redisUrlConfigured } from './redis-url'

const STORE_KEY = 'sn:marketplace'

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

export async function readCloudMarketplace(): Promise<CloudMarketplace> {
  if (!isCloudStoreConfigured()) return emptyStore()
  const store = await cloudGetJson<CloudMarketplace>(STORE_KEY)
  if (!store) return emptyStore()
  return {
    accounts: store.accounts || {},
    profiles: store.profiles || {},
    requests: store.requests || {},
    updatedAt: store.updatedAt || new Date().toISOString(),
  }
}

async function writeCloudMarketplace(store: CloudMarketplace): Promise<boolean> {
  if (!isCloudStoreConfigured()) return false
  store.updatedAt = new Date().toISOString()
  return cloudSetJson(STORE_KEY, store)
}

export async function cloudUpsertAccount(account: StoredAccount): Promise<boolean> {
  const key = normalizePhone(account.phone)
  if (!key) return false
  const store = await readCloudMarketplace()
  store.accounts[key] = account
  return writeCloudMarketplace(store)
}

export async function cloudUpsertProfile(profile: SkillProfile): Promise<boolean> {
  if (!profile.id) return false
  const store = await readCloudMarketplace()
  store.profiles[profile.id] = profile
  return writeCloudMarketplace(store)
}

export async function cloudUpsertRequest(request: JobRequest): Promise<boolean> {
  if (!request.id) return false
  const store = await readCloudMarketplace()
  store.requests[request.id] = request
  return writeCloudMarketplace(store)
}

export function cloudToArrays(store: CloudMarketplace) {
  return {
    accounts: Object.values(store.accounts),
    profiles: Object.values(store.profiles),
    requests: Object.values(store.requests),
  }
}
