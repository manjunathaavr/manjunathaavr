/** Minimal Upstash / Vercel KV REST client (no extra dependency). */

export function kvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

async function kvCommand<T>(...args: string[]): Promise<T | null> {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { result?: T }
    return data.result ?? null
  } catch {
    return null
  }
}

export async function kvGetJson<T>(key: string): Promise<T | null> {
  const raw = await kvCommand<string>('GET', key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function kvSetJson(key: string, value: unknown): Promise<boolean> {
  const result = await kvCommand<string>('SET', key, JSON.stringify(value))
  return result === 'OK'
}
