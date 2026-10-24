import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { OrderSummary } from '@/components/OrderSummary'
import { loadCart, readLastOrder, type SummaryData } from '@/lib/cart'
import { bestUrl } from '@/lib/media'
import { formatDate, formatPrice, isLocale, t, type Locale } from '@/lib/locale'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  return { title: t('orderConfirmed', locale), robots: { index: false } }
}

export default async function ConfirmationPage({ params }: PageProps) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const order = await readLastOrder()
  if (!order) redirect(`/${locale}`)

  // Titles and photographs in the language being viewed; amounts as charged.
  const products = await loadCart(locale, order.lines)
  const byId = new Map(products.items.map((item) => [item.id, item]))
  const money = (value: number) => formatPrice(value, order.currency, locale) ?? ''

  const summary: SummaryData = {
    items: order.lines.map((line) => {
      const product = byId.get(line.id)
      return {
        id: line.id,
        title: product?.title ?? '—',
        qty: line.qty,
        lineTotal: money(line.unitPrice * line.qty),
        imageUrl: product?.image ? bestUrl(product.image, 'thumbnail') : null,
      }
    }),
    subtotal: money(order.subtotal),
    shipping: order.shipping === 0 ? t('shippingFree', locale) : money(order.shipping),
    total: money(order.total),
  }

  const country =
    new Intl.DisplayNames([locale], { type: 'region' }).of(order.delivery.country) ??
    order.delivery.country

  return (
    <div className="container">
      <div className="confirm">
        <div className="confirm__head">
          <span className="confirm__check" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <p className="confirm__number">
            {t('orderNumber', locale)} {order.number}
          </p>
          <h1 className="confirm__title">{t('orderConfirmed', locale)}</h1>
          <p className="confirm__note">{t('demoNoCharge', locale)}</p>
        </div>

        <div className="confirm__grid">
          <dl className="confirm__details">
            <div>
              <dt>{t('orderDate', locale)}</dt>
              <dd>{formatDate(order.placedAt, locale)}</dd>
            </div>
            <div>
              <dt>{t('paidWith', locale)}</dt>
              <dd>{order.payment.detail}</dd>
            </div>
            <div>
              <dt>{t('emailAddress', locale)}</dt>
              <dd>{order.email}</dd>
            </div>
            <div>
              <dt>{t('deliverTo', locale)}</dt>
              <dd>
                {order.delivery.name}
                <br />
                {order.delivery.address}
                <br />
                {order.delivery.postalCode} {order.delivery.city}
                <br />
                {country}
              </dd>
            </div>
          </dl>

          <OrderSummary data={summary} locale={locale} />
        </div>

        <div className="see-more">
          <Link href={`/${locale}`} className="btn-accent">
            {t('backToCatalogue', locale)}
          </Link>
        </div>
      </div>
    </div>
  )
}
