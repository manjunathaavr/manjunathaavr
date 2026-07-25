import { NextResponse } from 'next/server'
import {
  cloudUpsertAccount,
  cloudUpsertProfile,
  cloudUpsertRequest,
  isCloudStoreConfigured,
} from '@/lib/cloud-store'
import type { JobRequest, StoredAccount, SkillProfile } from '@/lib/storage'

export async function POST(req: Request) {
  if (!isCloudStoreConfigured()) {
    return NextResponse.json({ ok: false, reason: 'not_configured' })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid_json' }, { status: 400 })
  }

  const payload = body as {
    type?: string
    data?: StoredAccount | SkillProfile | JobRequest
  }

  if (payload.type === 'account' && payload.data) {
    const ok = await cloudUpsertAccount(payload.data as StoredAccount)
    return NextResponse.json({ ok })
  }
  if (payload.type === 'profile' && payload.data) {
    const ok = await cloudUpsertProfile(payload.data as SkillProfile)
    return NextResponse.json({ ok })
  }
  if (payload.type === 'request' && payload.data) {
    const ok = await cloudUpsertRequest(payload.data as JobRequest)
    return NextResponse.json({ ok })
  }

  return NextResponse.json({ ok: false, reason: 'invalid_payload' }, { status: 400 })
}
