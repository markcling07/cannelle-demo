'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { t, type Locale } from '@/lib/locale'

export type SortKey = 'default' | 'price-asc' | 'price-desc'

export function SortSelect({ current, locale }: { current: SortKey; locale: Locale }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const onChange = (value: string) => {
    const next = new URLSearchParams(searchParams?.toString() ?? '')

    if (value === 'default') next.delete('sort')
    else next.set('sort', value)

    // A new ordering starts from the first page again.
    next.delete('show')

    const query = next.toString()
    router.push(query ? `${pathname}?${query}` : (pathname ?? '/'))
  }

  return (
    <span className="sort">
      <label htmlFor="sort-select">{t('sortBy', locale)}</label>
      <select
        id="sort-select"
        value={current}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="default">{t('sortDefault', locale)}</option>
        <option value="price-asc">{t('sortPriceAsc', locale)}</option>
        <option value="price-desc">{t('sortPriceDesc', locale)}</option>
      </select>
    </span>
  )
}
