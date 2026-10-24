'use server'

import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import {
  MAX_QUANTITY,
  clampQuantity,
  loadCart,
  newOrderNumber,
  readCart,
  writeCart,
  writeLastOrder,
  type PaymentMethod,
} from '@/lib/cart'
import { isLocale, type Locale } from '@/lib/locale'

export async function addToCart(productId: number, quantity: number): Promise<{ ok: boolean }> {
  const qty = clampQuantity(quantity)
  if (!Number.isInteger(productId) || qty < 1) return { ok: false }

  // Only a published product with a price can go in the basket. Without a
  // signed-in user, the collection's own access rules hide drafts.
  const payload = await getPayload({ config })
  const product = await payload
    .findByID({ collection: 'products', id: productId, depth: 0, draft: false, overrideAccess: false })
    .catch(() => null)

  if (!product || product._status !== 'published' || typeof product.price !== 'number') {
    return { ok: false }
  }

  const lines = await readCart()
  const existing = lines.find((line) => line.id === productId)

  if (existing) existing.qty = Math.min(MAX_QUANTITY, existing.qty + qty)
  else lines.push({ id: productId, qty })

  await writeCart(lines)
  return { ok: true }
}

/** A quantity of 0 removes the line. */
export async function setCartQuantity(productId: number, quantity: number): Promise<void> {
  const qty = clampQuantity(quantity)
  const lines = await readCart()

  await writeCart(
    qty === 0
      ? lines.filter((line) => line.id !== productId)
      : lines.map((line) => (line.id === productId ? { ...line, qty } : line)),
  )
}

export type CheckoutDetails = {
  email: string
  payment: { method: PaymentMethod; detail: string }
  delivery: { name: string; address: string; postalCode: string; city: string; country: string }
}

const clean = (value: unknown, max = 200): string => String(value ?? '').trim().slice(0, max)

/**
 * Called once the simulated gateway has "approved" the payment. Records the
 * order for the confirmation page, empties the basket and moves on.
 *
 * Nothing is persisted and nothing is charged. Only a masked description of
 * the payment ("Visa •••• 4242") ever reaches the server.
 */
export async function placeMockOrder(
  rawLocale: string,
  details: CheckoutDetails,
): Promise<{ error: 'empty' }> {
  const locale: Locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const cart = await loadCart(locale)

  if (cart.items.length === 0) return { error: 'empty' }

  const method: PaymentMethod = ['card', 'mobile', 'paypal'].includes(details.payment?.method)
    ? details.payment.method
    : 'card'

  await writeLastOrder({
    number: newOrderNumber(),
    placedAt: new Date().toISOString(),
    lines: cart.items.map((item) => ({ id: item.id, qty: item.qty, unitPrice: item.price })),
    subtotal: cart.subtotal,
    shipping: cart.shipping,
    total: cart.total,
    currency: cart.currency,
    email: clean(details.email, 120),
    payment: { method, detail: clean(details.payment?.detail, 80) },
    delivery: {
      name: clean(details.delivery?.name),
      address: clean(details.delivery?.address),
      postalCode: clean(details.delivery?.postalCode, 20),
      city: clean(details.delivery?.city),
      country: clean(details.delivery?.country, 2),
    },
  })

  await writeCart([])
  redirect(`/${locale}/checkout/confirmation`)
}
