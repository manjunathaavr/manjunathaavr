import {
  EXTRA_PACK_PRICE_INR,
  PAID_REQUESTS_PER_PACK,
  recordPaidRequestPack,
} from './storage'

export type PaymentConfig = {
  /** demo = simulate success; razorpay = live/test Razorpay Checkout */
  mode: 'demo' | 'razorpay'
  keyId: string
  amountInr: number
  packSize: number
  /** Optional backend URL to create order / verify payment (recommended for production) */
  orderApiUrl: string
  verifyApiUrl: string
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance
  }
}

type RazorpayCheckoutOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id?: string
  prefill?: { name?: string; contact?: string }
  theme?: { color?: string }
  handler: (response: {
    razorpay_payment_id: string
    razorpay_order_id?: string
    razorpay_signature?: string
  }) => void
  modal?: { ondismiss?: () => void }
}

type RazorpayInstance = {
  open: () => void
  on: (event: string, handler: (response: unknown) => void) => void
}

export function getPaymentConfig(): PaymentConfig {
  const keyId = (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '').trim()
  const modeEnv = (process.env.NEXT_PUBLIC_PAYMENT_MODE ?? '').trim()
  const mode: 'demo' | 'razorpay' =
    modeEnv === 'razorpay' || (modeEnv !== 'demo' && Boolean(keyId))
      ? 'razorpay'
      : 'demo'

  return {
    mode: keyId && mode === 'razorpay' ? 'razorpay' : 'demo',
    keyId,
    amountInr: EXTRA_PACK_PRICE_INR,
    packSize: PAID_REQUESTS_PER_PACK,
    orderApiUrl: (process.env.NEXT_PUBLIC_PAYMENT_ORDER_URL ?? '').trim(),
    verifyApiUrl: (process.env.NEXT_PUBLIC_PAYMENT_VERIFY_URL ?? '').trim(),
  }
}

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-razorpay="1"]',
    )
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () =>
        reject(new Error('Could not load Razorpay')),
      )
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.razorpay = '1'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load Razorpay'))
    document.body.appendChild(script)
  })
}

async function createOrderId(
  config: PaymentConfig,
  phone: string,
): Promise<string | undefined> {
  if (!config.orderApiUrl) return undefined
  const res = await fetch(config.orderApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amountInr: config.amountInr,
      phone,
      purpose: 'extra_requests_pack',
      packSize: config.packSize,
    }),
  })
  if (!res.ok) throw new Error('Could not create payment order')
  const data = (await res.json()) as { orderId?: string; id?: string }
  return data.orderId || data.id
}

async function verifyPayment(
  config: PaymentConfig,
  payload: {
    razorpay_payment_id: string
    razorpay_order_id?: string
    razorpay_signature?: string
    phone: string
  },
): Promise<boolean> {
  if (!config.verifyApiUrl) return true
  const res = await fetch(config.verifyApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) return false
  const data = (await res.json()) as { ok?: boolean; verified?: boolean }
  return Boolean(data.ok ?? data.verified)
}

export type BuyExtraPackResult =
  | { ok: true; paymentId: string; mode: 'razorpay' | 'demo' }
  | { ok: false; reason: 'cancelled' | 'failed' | 'misconfigured'; message: string }

/**
 * Charge ₹1 for +3 help requests today.
 * Uses Razorpay when NEXT_PUBLIC_RAZORPAY_KEY_ID is set; otherwise demo checkout.
 */
export function buyExtraRequestPack(input: {
  phone: string
  name?: string
}): Promise<BuyExtraPackResult> {
  const config = getPaymentConfig()
  const phone = input.phone.replace(/\D/g, '').slice(-10)
  if (!phone) {
    return Promise.resolve({
      ok: false,
      reason: 'failed',
      message: 'Enter a valid mobile number before paying.',
    })
  }

  if (config.mode === 'demo') {
    const confirmed = window.confirm(
      `Demo payment\n\nPay ₹${config.amountInr} for ${config.packSize} more requests today?\n\n(No real charge — set NEXT_PUBLIC_RAZORPAY_KEY_ID for Razorpay.)`,
    )
    if (!confirmed) {
      return Promise.resolve({
        ok: false,
        reason: 'cancelled',
        message: 'Payment cancelled.',
      })
    }
    const paymentId = `demo_${Date.now()}`
    recordPaidRequestPack({ phone, paymentId, mode: 'demo' })
    return Promise.resolve({ ok: true, paymentId, mode: 'demo' })
  }

  if (!config.keyId) {
    return Promise.resolve({
      ok: false,
      reason: 'misconfigured',
      message:
        'Razorpay key is missing. Add NEXT_PUBLIC_RAZORPAY_KEY_ID in .env or use demo mode.',
    })
  }

  return new Promise((resolve) => {
    void (async () => {
      try {
        await loadRazorpayScript()
        if (!window.Razorpay) {
          resolve({
            ok: false,
            reason: 'failed',
            message: 'Razorpay failed to load. Check your network.',
          })
          return
        }

        let orderId: string | undefined
        try {
          orderId = await createOrderId(config, phone)
        } catch {
          resolve({
            ok: false,
            reason: 'failed',
            message: 'Could not start payment order. Try again.',
          })
          return
        }

        let settled = false
        const rzp = new window.Razorpay({
          key: config.keyId,
          amount: Math.round(config.amountInr * 100),
          currency: 'INR',
          name: 'Swayam Nirman',
          description: `${config.packSize} extra help requests for today`,
          order_id: orderId,
          prefill: {
            name: input.name,
            contact: phone,
          },
          theme: { color: '#f58d3d' },
          handler: (response) => {
            void (async () => {
              const verified = await verifyPayment(config, {
                ...response,
                phone,
              })
              if (!verified) {
                settled = true
                resolve({
                  ok: false,
                  reason: 'failed',
                  message: 'Payment could not be verified. Contact support if charged.',
                })
                return
              }
              recordPaidRequestPack({
                phone,
                paymentId: response.razorpay_payment_id,
                mode: 'razorpay',
              })
              settled = true
              resolve({
                ok: true,
                paymentId: response.razorpay_payment_id,
                mode: 'razorpay',
              })
            })()
          },
          modal: {
            ondismiss: () => {
              if (!settled) {
                resolve({
                  ok: false,
                  reason: 'cancelled',
                  message: 'Payment cancelled.',
                })
              }
            },
          },
        })

        rzp.on('payment.failed', () => {
          settled = true
          resolve({
            ok: false,
            reason: 'failed',
            message: 'Payment failed. Please try again.',
          })
        })

        rzp.open()
      } catch (err) {
        resolve({
          ok: false,
          reason: 'failed',
          message:
            err instanceof Error ? err.message : 'Payment could not be started.',
        })
      }
    })()
  })
}
