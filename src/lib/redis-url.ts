import { createClient, type RedisClientType } from 'redis'

let client: RedisClientType | null = null
let connecting: Promise<RedisClientType | null> | null = null

export function redisUrlConfigured(): boolean {
  return Boolean(process.env.REDIS_URL)
}

async function getRedis(): Promise<RedisClientType | null> {
  const url = process.env.REDIS_URL
  if (!url) return null
  if (client?.isOpen) return client
  if (!connecting) {
    connecting = (async () => {
      try {
        const c = createClient({ url })
        c.on('error', () => {
          /* logged by platform */
        })
        await c.connect()
        client = c
        return c
      } catch {
        connecting = null
        return null
      }
    })()
  }
  return connecting
}

export async function redisGetJson<T>(key: string): Promise<T | null> {
  const c = await getRedis()
  if (!c) return null
  try {
    const raw = await c.get(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function redisSetJson(key: string, value: unknown): Promise<boolean> {
  const c = await getRedis()
  if (!c) return false
  try {
    await c.set(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
