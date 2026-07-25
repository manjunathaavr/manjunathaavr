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
    accounts?: StoredAccount[]
    profiles?: SkillProfile[]
    requests?: JobRequest[]
  }

  for (const account of payload.accounts || []) {
    await cloudUpsertAccount(account)
  }
  for (const profile of payload.profiles || []) {
    await cloudUpsertProfile(profile)
  }
  for (const request of payload.requests || []) {
    await cloudUpsertRequest(request)
  }

  return NextResponse.json({ ok: true })
}
