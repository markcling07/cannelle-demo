'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

export type NavItem = {
  href: string
  label: string
  children?: NavItem[]
  /** Drawn as a button at the end of the menu. */
  cta?: boolean
  /** Current only on this exact address, not on the pages beneath it. */
  exact?: boolean
}

/**
 * The header. On a desktop the menu is a second row with drop-downs for
 * About and Our companies; below 1080px it folds into a "Menu" button that
 * opens a panel listing everything, sub-pages included.
 */
export function MainNav({
  brand,
  tools,
  items,
  homeHref,
  labels,
}: {
  brand: ReactNode
  tools: ReactNode
  items: NavItem[]
  homeHref: string
  labels: { menu: string; mainMenu: string }
}) {
  const pathname = usePathname() ?? homeHref
  const [open, setOpen] = useState(false)

  // Close the panel once the visitor has picked a page.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const isCurrent = ({ href, exact }: NavItem): boolean =>
    exact || href === homeHref
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`)

  const link = (item: NavItem, current: boolean, hasChildren = false) => (
    <Link
      href={item.href}
      className={current ? 'main-nav__link is-current' : 'main-nav__link'}
      aria-current={current ? 'page' : undefined}
    >
      {item.label}
      {hasChildren ? <span className="main-nav__caret" aria-hidden="true" /> : null}
    </Link>
  )

  return (
    <header className="site-header" data-open={open}>
      <div className="container site-header__top">
        {brand}

        <div className="site-header__tools">
          {tools}
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="main-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="menu-toggle__bars" aria-hidden="true" />
            {labels.menu}
          </button>
        </div>
      </div>

      <nav id="main-menu" className="main-nav" aria-label={labels.mainMenu}>
        <ul className="container main-nav__list">
          {items.map((item) => {
            const children = item.children ?? []
            const current = isCurrent(item) || children.some((child) => isCurrent(child))

            return (
              <li
                key={item.href}
                className={item.cta ? 'main-nav__item main-nav__item--cta' : 'main-nav__item'}
              >
                {link(item, current, children.length > 0)}

                {children.length > 0 ? (
                  <ul className="main-nav__sub">
                    {children.map((child) => (
                      <li key={child.href}>{link(child, isCurrent(child))}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
