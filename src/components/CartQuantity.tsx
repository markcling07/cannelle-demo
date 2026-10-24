'use client'

import { useTransition } from 'react'

import { setCartQuantity } from '@/app/(frontend)/cart-actions'
import { QuantityStepper } from '@/components/QuantityStepper'
import { t, type Locale } from '@/lib/locale'

/** Quantity and remove controls for one line of the cart page. */
export function CartQuantity({
  productId,
  qty,
  max,
  locale,
}: {
  productId: number
  qty: number
  /** The stock left, capped at 20. */
  max: number
  locale: Locale
}) {
  const [pending, startTransition] = useTransition()

  const set = (next: number) => startTransition(() => setCartQuantity(productId, next))

  return (
    <div className="cart-line__controls" aria-busy={pending}>
      <QuantityStepper
        value={qty}
        onChange={set}
        // A line already over the stock can still come down to it.
        max={Math.max(max, Math.min(qty, 20))}
        disabled={pending}
        labels={{
          group: t('quantity', locale),
          decrease: t('decrease', locale),
          increase: t('increase', locale),
        }}
      />
      <button type="button" className="link-button" onClick={() => set(0)} disabled={pending}>
        {t('remove', locale)}
      </button>
    </div>
  )
}
