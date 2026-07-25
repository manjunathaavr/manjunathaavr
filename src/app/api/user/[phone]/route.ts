import { NextResponse } from 'next/server'
import {
  isCloudStoreConfigured,
  readCloudMarketplace,
} from '@/lib/cloud-store'
import { normalizePhone } from '@/lib/storage'

export async function GET(
  _req: Request,
  context: { params: Promise<{ phone: string }> },
) {
  const { phone: raw } = await context.params
  const phone = normalizePhone(raw)
  if (phone.length !== 10) {
    return NextResponse.json({ error: 'invalid_phone' }, { status: 400 })
  }

  if (!isCloudStoreConfigured()) {
    return NextResponse.json({
      configured: false,
      account: null,
      profiles: [],
      requests: [],
    })
  }

  const store = await readCloudMarketplace()
  const account = store.accounts[phone] || null
  const profiles = Object.values(store.profiles).filter(
    (p) => normalizePhone(p.phone) === phone,
  )
  const requests = Object.values(store.requests).filter(
    (r) => normalizePhone(r.requesterPhone) === phone,
  )

  return NextResponse.json({
    configured: true,
    account,
    profiles,
    requests,
  })
}
