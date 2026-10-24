'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cartLabel, t, type Locale } from '@/lib/locale'

/**
 * Catalogue, Journal and cart links, marking the section the visitor is in.
 * Product pages count as the catalogue; articles count as the journal; the
 * checkout counts as the cart.
 */
export function SiteNav({ locale, cartCount }: { locale: Locale; cartCount: number }) {
  const pathname = usePathname() ?? `/${locale}`
  const inJournal = pathname.startsWith(`/${locale}/journal`)
  const inCart =
    pathname.startsWith(`/${locale}/cart`) || pathname.startsWith(`/${locale}/checkout`)

  const links = [
    { href: `/${locale}`, label: t('catalogue', locale), current: !inJournal && !inCart },
    { href: `/${locale}/journal`, label: t('journal', locale), current: inJournal },
  ]

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={link.current ? 'is-current' : undefined}
          aria-current={link.current ? 'true' : undefined}
        >
          {link.label}
        </Link>
      ))}

      <Link
        href={`/${locale}/cart`}
        className={inCart ? 'cart-link is-current' : 'cart-link'}
        aria-current={inCart ? 'true' : undefined}
        aria-label={cartLabel(cartCount, locale)}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8zM9 8V6.5a3 3 0 0 1 6 0V8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        {cartCount > 0 ? <span className="cart-link__count">{cartCount}</span> : null}
      </Link>
    </>
  )
}
