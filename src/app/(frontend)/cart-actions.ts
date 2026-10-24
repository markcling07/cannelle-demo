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

type AddResult = { ok: true } | { ok: false; reason: 'unavailable' } | { ok: false; reason: 'stock'; stock: number }

/** Published, priced, on sale — with its stock, or null when not tracked. */
const purchasable = async (productId: number) => {
  // Without a signed-in user, the collection's own access rules hide drafts.
  const payload = await getPayload({ config })
  const product = await payload
    .findByID({ collection: 'products', id: productId, depth: 0, draft: false, overrideAccess: false })
    .catch(() => null)

  if (
    !product ||
    product._status !== 'published' ||
    typeof product.price !== 'number' ||
    product.inStock === false ||
    product.stock === 0
  ) {
    return null
  }

  return { stock: typeof product.stock === 'number' ? product.stock : null }
}

export async function addToCart(productId: number, quantity: number): Promise<AddResult> {
  const qty = clampQuantity(quantity)
  if (!Number.isInteger(productId) || qty < 1) return { ok: false, reason: 'unavailable' }

  const product = await purchasable(productId)
  if (!product) return { ok: false, reason: 'unavailable' }

  const lines = await readCart()
  const existing = lines.find((line) => line.id === productId)
  const wanted = (existing?.qty ?? 0) + qty

  // The cart can never hold more than is left.
  if (product.stock !== null && wanted > product.stock) {
    return { ok: false, reason: 'stock', stock: product.stock }
  }

  if (existing) existing.qty = Math.min(MAX_QUANTITY, wanted)
  else lines.push({ id: productId, qty })

  await writeCart(lines)
  return { ok: true }
}

/** A quantity of 0 removes the line; anything else is capped at the stock. */
export async function setCartQuantity(productId: number, quantity: number): Promise<void> {
  let qty = clampQuantity(quantity)

  if (qty > 0) {
    const product = await purchasable(productId)
    if (product?.stock != null) qty = Math.min(qty, product.stock)
  }

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
 * Nothing is charged and the order itself is not stored; only the stock
 * goes down. Only a masked description of the payment ("Visa •••• 4242")
 * ever reaches the server.
 */
export async function placeMockOrder(
  rawLocale: string,
  details: CheckoutDetails,
): Promise<{ error: 'empty' | 'stock' }> {
  const locale: Locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const cart = await loadCart(locale)

  if (cart.items.length === 0) return { error: 'empty' }
  if (cart.hasStockIssue) return { error: 'stock' }

  // The order goes through, so the units leave the stock, as they would
  // with a real gateway. Products without a stock figure are not tracked.
  const payload = await getPayload({ config })

  for (const item of cart.items) {
    if (item.stock === null) continue

    await payload.update({
      collection: 'products',
      id: item.id,
      data: { stock: Math.max(0, item.stock - item.qty) },
    })
  }

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
