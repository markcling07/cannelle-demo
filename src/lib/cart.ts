import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import type { Media } from '@/payload-types'
import { asMedia, bestUrl } from '@/lib/media'
import { formatPrice, t, type Locale } from '@/lib/locale'

/**
 * The basket for the mock checkout.
 *
 * It lives in a cookie holding product ids and quantities only — never prices
 * or titles — so the cart and checkout pages always show the current price
 * and the visitor's language, read from the catalogue on the server.
 *
 * No payment gateway is connected: the checkout simulates one in the browser
 * and nothing is charged. Card numbers never leave the visitor's browser.
 */
export const CART_COOKIE = 'cannelle_cart'
export const ORDER_COOKIE = 'cannelle_last_order'

export const MAX_QUANTITY = 20
const MAX_LINES = 30

export const SHIPPING_FLAT = 4.9
export const FREE_SHIPPING_FROM = 50

export type CartLine = { id: number; qty: number }

export const clampQuantity = (value: unknown): number =>
  Math.min(MAX_QUANTITY, Math.max(0, Math.floor(Number(value)) || 0))

const roundMoney = (value: number): number => Math.round(value * 100) / 100

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  maxAge,
})

const parseCart = (raw: string | undefined): CartLine[] => {
  if (!raw) return []

  try {
    const data: unknown = JSON.parse(raw)
    if (!Array.isArray(data)) return []

    return data
      .map((line) => ({ id: Number(line?.id), qty: clampQuantity(line?.qty) }))
      .filter((line) => Number.isInteger(line.id) && line.id > 0 && line.qty > 0)
      .slice(0, MAX_LINES)
  } catch {
    return []
  }
}

export const readCart = async (): Promise<CartLine[]> =>
  parseCart((await cookies()).get(CART_COOKIE)?.value)

/** Only callable from a server action, like any cookie write. */
export const writeCart = async (lines: CartLine[]): Promise<void> => {
  const store = await cookies()

  if (lines.length === 0) {
    store.delete(CART_COOKIE)
    return
  }

  store.set(CART_COOKIE, JSON.stringify(lines), cookieOptions(60 * 60 * 24 * 30))
}

export const countItems = (lines: CartLine[]): number =>
  lines.reduce((sum, line) => sum + line.qty, 0)

export const shippingFor = (subtotal: number): number =>
  subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FLAT

export type CartItem = {
  id: number
  qty: number
  title: string
  slug: string
  price: number
  currency: string
  image: Media | null
  lineTotal: number
}

export type Cart = {
  items: CartItem[]
  count: number
  subtotal: number
  shipping: number
  total: number
  /** Every sample product is in euros; mixed currencies are not handled. */
  currency: string
}

/**
 * The basket with each line's current title, price and photograph. Lines whose
 * product has been unpublished, deleted or has no price are dropped.
 */
export const loadCart = async (locale: Locale, lines?: CartLine[]): Promise<Cart> => {
  const cartLines = lines ?? (await readCart())

  if (cartLines.length === 0) {
    return { items: [], count: 0, subtotal: 0, shipping: 0, total: 0, currency: 'EUR' }
  }

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'products',
    locale,
    depth: 1,
    limit: cartLines.length,
    draft: false,
    where: {
      and: [
        { id: { in: cartLines.map((line) => line.id) } },
        { _status: { equals: 'published' } },
      ],
    },
  })

  const byId = new Map(docs.map((doc) => [doc.id, doc]))

  const items: CartItem[] = cartLines.flatMap((line) => {
    const product = byId.get(line.id)
    if (!product || typeof product.price !== 'number') return []

    return [
      {
        id: product.id,
        qty: line.qty,
        title: product.title ?? '',
        slug: product.slug ?? '',
        price: product.price,
        currency: product.currency ?? 'EUR',
        image: asMedia(product.image),
        lineTotal: roundMoney(product.price * line.qty),
      },
    ]
  })

  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.lineTotal, 0))
  const shipping = shippingFor(subtotal)

  return {
    items,
    count: items.reduce((sum, item) => sum + item.qty, 0),
    subtotal,
    shipping,
    total: roundMoney(subtotal + shipping),
    currency: items[0]?.currency ?? 'EUR',
  }
}

/** Plain, already formatted figures for the order summary panel. */
export type SummaryData = {
  items: { id: number; title: string; qty: number; lineTotal: string; imageUrl: string | null }[]
  subtotal: string
  shipping: string
  total: string
}

const money = (value: number, currency: string, locale: Locale): string =>
  formatPrice(value, currency, locale) ?? ''

export const toSummary = (cart: Cart, locale: Locale): SummaryData => ({
  items: cart.items.map((item) => ({
    id: item.id,
    title: item.title,
    qty: item.qty,
    lineTotal: money(item.lineTotal, cart.currency, locale),
    imageUrl: item.image ? bestUrl(item.image, 'thumbnail') : null,
  })),
  subtotal: money(cart.subtotal, cart.currency, locale),
  shipping: cart.shipping === 0 ? t('shippingFree', locale) : money(cart.shipping, cart.currency, locale),
  total: money(cart.total, cart.currency, locale),
})

// --- the order the confirmation page shows ----------------------------------

export type PaymentMethod = 'card' | 'mobile' | 'paypal'

export type MockOrder = {
  number: string
  placedAt: string
  lines: { id: number; qty: number; unitPrice: number }[]
  subtotal: number
  shipping: number
  total: number
  currency: string
  email: string
  payment: { method: PaymentMethod; detail: string }
  delivery: { name: string; address: string; postalCode: string; city: string; country: string }
}

/** Kept for a day so the confirmation page survives a refresh. */
export const writeLastOrder = async (order: MockOrder): Promise<void> => {
  ;(await cookies()).set(ORDER_COOKIE, JSON.stringify(order), cookieOptions(60 * 60 * 24))
}

export const readLastOrder = async (): Promise<MockOrder | null> => {
  const raw = (await cookies()).get(ORDER_COOKIE)?.value
  if (!raw) return null

  try {
    const order = JSON.parse(raw) as MockOrder
    return typeof order?.number === 'string' && Array.isArray(order.lines) ? order : null
  } catch {
    return null
  }
}

/** "CAN-261024-4821": date plus four random digits. */
export const newOrderNumber = (date = new Date()): string => {
  const stamp = date.toISOString().slice(2, 10).replace(/-/g, '')
  const suffix = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `CAN-${stamp}-${suffix}`
}
