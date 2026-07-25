import { createClient } from 'redis'

type AppRedisClient = ReturnType<typeof createClient>

let client: AppRedisClient | null = null
let connecting: Promise<AppRedisClient | null> | null = null

/** Vercel Marketplace Redis may inject REDIS_URL or a custom prefix like STORAGE_URL. */
function redisUrlFromEnv(): string | undefined {
  return (
    process.env.REDIS_URL ||
    process.env.STORAGE_URL ||
    process.env.UPSTASH_REDIS_REDIS_URL ||
    process.env.KV_URL
  )
}

export function redisUrlConfigured(): boolean {
  return Boolean(redisUrlFromEnv())
}

async function getRedis(): Promise<AppRedisClient | null> {
  const url = redisUrlFromEnv()
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
