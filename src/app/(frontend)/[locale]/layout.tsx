import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { SiteNav } from '@/components/SiteNav'
import { countItems, readCart } from '@/lib/cart'
import { LOCALES, isLocale, t, type Locale } from '@/lib/locale'
import { asMedia } from '@/lib/media'
import '../styles.css'

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'site-settings', locale, depth: 1 })

  const name = settings?.siteName ?? 'GROUPE JAOVAZAHA'
  const logo = asMedia(settings?.logo)

  return {
    title: { default: name, template: `%s — ${name}` },
    description: settings?.tagline ?? undefined,
    icons: logo?.url ? { icon: logo.url } : undefined,
  }
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale: raw } = await params

  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'site-settings', locale, depth: 1 })

  const siteName = settings?.siteName ?? 'GROUPE JAOVAZAHA'
  const logo = asMedia(settings?.logo)

  return (
    <html lang={locale}>
      <body>
        <a className="skip-link" href="#content">
          {t('skipToContent', locale)}
        </a>

        <div className="demo-banner" role="status">
          {t('demoNotice', locale)}
        </div>

        <header className="container site-header__inner">
          <Link href={`/${locale}`} className={logo?.url ? 'brand brand--with-logo' : 'brand'}>
            {/* The site name beside it already names the link, so the logo is decorative. */}
            {logo?.url ? <img src={logo.url} alt="" className="brand__logo" /> : null}
            <span className="brand__name">{siteName}</span>
          </Link>

          <nav className="site-nav" aria-label={siteName}>
            <SiteNav locale={locale} cartCount={countItems(await readCart())} />
            <LocaleSwitcher current={locale} />
          </nav>
        </header>

        <main id="content">{children}</main>

        <footer className="container site-footer">
          <p className="site-footer__wordmark">{siteName}</p>

          <div className="site-footer__bar">
            <nav className="site-footer__nav" aria-label={siteName}>
              <Link href={`/${locale}`}>{t('catalogue', locale)}</Link>
              <Link href={`/${locale}/journal`}>{t('journal', locale)}</Link>
            </nav>

            <div className="site-footer__contact">
              {settings?.contactEmail ? (
                <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
              ) : null}
              {settings?.contactPhone ? (
                <a href={`tel:${settings.contactPhone.replace(/\s+/g, '')}`}>
                  {settings.contactPhone}
                </a>
              ) : null}
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
