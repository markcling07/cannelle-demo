'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { addToCart } from '@/app/(frontend)/cart-actions'
import { QuantityStepper } from '@/components/QuantityStepper'
import { formatPrice, t, type Locale } from '@/lib/locale'

type Status = 'idle' | 'added' | 'error'

type Props = {
  productId: number
  price: number
  currency: string | null | undefined
  locale: Locale
}

export function AddToCart({ productId, price, currency, locale }: Props) {
  const router = useRouter()
  const [qty, setQty] = useState(1)
  const [status, setStatus] = useState<Status>('idle')
  const [pending, startTransition] = useTransition()

  // Rounded to the cent, the same way the cart computes its line totals.
  const total = Math.round(price * qty * 100) / 100

  const add =(thenCheckout: boolean) =>
    startTransition(async () => {
      const result = await addToCart(productId, qty)

      if (!result.ok) {
        setStatus('error')
        return
      }

      if (thenCheckout) router.push(`/${locale}/checkout`)
      else setStatus('added')
    })

  return (
    <div className="buy">
      <div className="buy__row">
        <QuantityStepper
          value={qty}
          onChange={(next) => {
            setQty(next)
            setStatus('idle')
          }}
          disabled={pending}
          labels={{
            group: t('quantity', locale),
            decrease: t('decrease', locale),
            increase: t('increase', locale),
          }}
        />

        <button
          type="button"
          className="btn-accent buy__add"
          onClick={() => add(false)}
          disabled={pending}
        >
          {t('addToCart', locale)}
        </button>
      </div>

      <p className="buy__total" aria-live="polite">
        <span className="buy__breakdown">
          {qty > 1 ? `${qty} × ${formatPrice(price, currency, locale)}` : null}
        </span>
        <span>
          {t('total', locale)} <strong>{formatPrice(total, currency, locale)}</strong>
        </span>
      </p>

      <button type="button" className="btn-ink" onClick={() => add(true)} disabled={pending}>
        {t('buyNow', locale)}
      </button>

      <p className="buy__status" role="status" data-state={status}>
        {status === 'added' ? (
          <>
            {t('addedToCart', locale)}{' '}
            <Link href={`/${locale}/cart`}>{t('viewCart', locale)}</Link>
          </>
        ) : null}
        {status === 'error' ? t('cartError', locale) : null}
      </p>
    </div>
  )
}
