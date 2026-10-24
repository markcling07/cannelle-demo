import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CartQuantity } from '@/components/CartQuantity'
import { FREE_SHIPPING_FROM, MAX_QUANTITY, loadCart } from '@/lib/cart'
import { bestUrl } from '@/lib/media'
import { fill, formatPrice, isLocale, t, type Locale } from '@/lib/locale'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  return { title: t('cart', locale), robots: { index: false } }
}

export default async function CartPage({ params }: PageProps) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const cart = await loadCart(locale)
  const money = (value: number) => formatPrice(value, cart.currency, locale) ?? ''
  const missingForFree = FREE_SHIPPING_FROM - cart.subtotal

  return (
    <div className="container">
      <h1 className="page-title">{t('cart', locale)}</h1>

      {cart.items.length === 0 ? (
        <>
          <p className="empty">{t('cartEmpty', locale)}</p>
          <div className="see-more">
            <Link href={`/${locale}`} className="btn-accent">
              {t('continueShopping', locale)}
            </Link>
          </div>
        </>
      ) : (
        <div className="cart">
          <ul className="cart-lines">
            {cart.items.map((item) => (
              <li key={item.id} className="cart-line">
                <Link href={`/${locale}/products/${item.slug}`} className="cart-line__media">
                  {item.image ? (
                    <img src={bestUrl(item.image, 'thumbnail')} alt={item.image.alt ?? ''} />
                  ) : null}
                </Link>

                <div className="cart-line__info">
                  <Link href={`/${locale}/products/${item.slug}`} className="cart-line__title">
                    {item.title}
                  </Link>
                  <p className="cart-line__unit">
                    {money(item.price)} {t('each', locale)}
                  </p>
                  <CartQuantity
                    productId={item.id}
                    qty={item.qty}
                    max={Math.min(MAX_QUANTITY, item.stock ?? MAX_QUANTITY)}
                    locale={locale}
                  />
                  {item.overStock ? (
                    <p className="cart-line__warning" role="alert">
                      {item.available
                        ? fill(t('cartOverStock', locale), { count: String(item.stock) })
                        : t('cartUnavailable', locale)}
                    </p>
                  ) : null}
                </div>

                <p className="cart-line__total">{money(item.lineTotal)}</p>
              </li>
            ))}
          </ul>

          <aside className="cart__summary">
            <dl className="totals">
              <div className="totals__row">
                <dt>{t('subtotal', locale)}</dt>
                <dd>{money(cart.subtotal)}</dd>
              </div>
              <div className="totals__row">
                <dt>{t('shipping', locale)}</dt>
                <dd>{cart.shipping === 0 ? t('shippingFree', locale) : money(cart.shipping)}</dd>
              </div>
              <div className="totals__row totals__row--grand">
                <dt>{t('total', locale)}</dt>
                <dd>{money(cart.total)}</dd>
              </div>
            </dl>

            {cart.shipping > 0 ? (
              <p className="cart__hint">
                {fill(t('freeShippingHint', locale), { amount: money(missingForFree) })}
              </p>
            ) : null}

            {cart.hasStockIssue ? (
              <p className="cart__hint cart__hint--warning">{t('orderStockError', locale)}</p>
            ) : (
              <Link href={`/${locale}/checkout`} className="btn-accent btn-block">
                {t('proceedToCheckout', locale)}
              </Link>
            )}

            <Link href={`/${locale}`} className="cart__continue">
              {t('continueShopping', locale)}
            </Link>
          </aside>
        </div>
      )}
    </div>
  )
}
