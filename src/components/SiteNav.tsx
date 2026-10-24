'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { t, type Locale } from '@/lib/locale'

/**
 * Catalogue and Journal links, marking the section the visitor is in.
 * Product pages count as the catalogue; articles count as the journal.
 */
export function SiteNav({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? `/${locale}`
  const inJournal = pathname.startsWith(`/${locale}/journal`)

  const links = [
    { href: `/${locale}`, label: t('catalogue', locale), current: !inJournal },
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
    </>
  )
}
