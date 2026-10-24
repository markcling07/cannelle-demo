import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { CheckoutForm } from '@/components/CheckoutForm'
import { loadCart, toSummary } from '@/lib/cart'
import { isLocale, t, type Locale } from '@/lib/locale'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  return { title: t('checkout', locale), robots: { index: false } }
}

export default async function CheckoutPage({ params }: PageProps) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const cart = await loadCart(locale)
  if (cart.items.length === 0) redirect(`/${locale}/cart`)

  const summary = toSummary(cart, locale)

  return (
    <div className="container">
      <Link href={`/${locale}/cart`} className="back-link">
        {t('backToCart', locale)}
      </Link>

      <h1 className="checkout__title">{t('checkout', locale)}</h1>

      <CheckoutForm locale={locale} summary={summary} totalLabel={summary.total} />
    </div>
  )
}
