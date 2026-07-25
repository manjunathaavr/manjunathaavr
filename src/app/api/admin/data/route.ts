import { NextResponse } from 'next/server'
import {
  cloudToArrays,
  isCloudStoreConfigured,
  readCloudMarketplace,
} from '@/lib/cloud-store'
import { isSuperAdminPhone } from '@/lib/storage'

export async function GET(req: Request) {
  const adminPhone = req.headers.get('X-Admin-Phone') || ''
  if (!isSuperAdminPhone(adminPhone)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const configured = isCloudStoreConfigured()
  if (!configured) {
    return NextResponse.json({
      configured: false,
      accounts: [],
      profiles: [],
      requests: [],
    })
  }

  const store = await readCloudMarketplace()
  const arrays = cloudToArrays(store)
  return NextResponse.json({
    configured: true,
    ...arrays,
  })
}
