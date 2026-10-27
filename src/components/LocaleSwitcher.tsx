'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { LOCALES, LOCALE_LABELS, type Locale } from '@/lib/locale'

/**
 * Swaps the language segment of the current address, keeping the rest of the
 * path. A product whose French and English addresses differ is handled by the
 * product page itself, which redirects to the correct address for the chosen
 * language.
 */
export function LocaleSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname() ?? `/${current}`

  const hrefFor = (locale: Locale): string => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 0) return `/${locale}`
    segments[0] = locale
    return `/${segments.join('/')}`
  }

  return (
    <div className="locale-switcher" role="group" aria-label={label}>
      {LOCALES.map((locale) => {
        const isCurrent = locale === current

        return (
          <Link
            key={locale}
            href={hrefFor(locale)}
            className={isCurrent ? 'locale-switcher__item is-current' : 'locale-switcher__item'}
            aria-current={isCurrent ? 'true' : undefined}
            hrefLang={locale}
          >
            {LOCALE_LABELS[locale]}
          </Link>
        )
      })}
    </div>
  )
}
