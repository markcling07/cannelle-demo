import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import React from 'react'

import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { MainNav, type NavItem } from '@/components/MainNav'
import { getCompanies, getGlobal } from '@/lib/content'
import { LOCALES, isLocale, t, type Locale } from '@/lib/locale'
import { asMedia, bestUrl } from '@/lib/media'
import '../styles.css'

// Fetched at build time and served from the site itself: no request to
// Google when a visitor opens a page.
const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
})

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

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

  const settings = await getGlobal('site-settings', locale)

  const name = settings?.siteName ?? 'GROUPE JAOVAZAHA'
  const logo = asMedia(settings?.logo)

  return {
    title: { default: name, template: `%s — ${name}` },
    description: settings?.tagline ?? undefined,
    icons: logo?.url ? { icon: bestUrl(logo, 'thumbnail') } : undefined,
  }
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale: raw } = await params

  if (!isLocale(raw)) notFound()
  const locale: Locale = raw
  const base = `/${locale}`

  const [settings, companies] = await Promise.all([
    getGlobal('site-settings', locale),
    getCompanies(locale),
  ])

  const siteName = settings?.siteName ?? 'GROUPE JAOVAZAHA'
  const logo = asMedia(settings?.logo)

  const companyLinks: NavItem[] = companies.map((company) => ({
    href: `${base}/companies/${company.slug}`,
    label: company.country ? `${company.shortName} — ${company.country}` : company.shortName,
  }))

  const items: NavItem[] = [
    {
      href: `${base}/about`,
      label: t('about', locale),
      children: [
        { href: `${base}/about`, label: t('aboutGroup', locale), exact: true },
        { href: `${base}/leadership`, label: t('leadership', locale) },
      ],
    },
    {
      href: `${base}/companies`,
      label: t('companies', locale),
      children: [
        { href: `${base}/companies`, label: t('companiesOverview', locale), exact: true },
        ...companyLinks,
      ],
    },
    { href: `${base}/products`, label: t('products', locale) },
    { href: `${base}/projects`, label: t('projects', locale) },
    { href: `${base}/partnerships`, label: t('partnerships', locale) },
    { href: `${base}/news`, label: t('news', locale) },
    { href: `${base}/gallery`, label: t('gallery', locale) },
    { href: `${base}/contact`, label: t('contact', locale), cta: true },
  ]

  const brand = (
    <Link href={base} className={logo?.url ? 'brand brand--with-logo' : 'brand'}>
      {/* The site name beside it already names the link, so the logo is decorative. */}
      {logo?.url ? <img src={bestUrl(logo, 'thumbnail')} alt="" className="brand__logo" /> : null}
      <span className="brand__name">{siteName}</span>
    </Link>
  )

  return (
    <html lang={locale} className={`${serif.variable} ${sans.variable}`}>
      <body>
        <a className="skip-link" href="#content">
          {t('skipToContent', locale)}
        </a>

        <div className="demo-banner" role="status">
          {t('demoNotice', locale)}
        </div>

        <MainNav
          brand={brand}
          tools={<LocaleSwitcher current={locale} label={t('language', locale)} />}
          items={items}
          homeHref={base}
          labels={{ menu: t('menu', locale), mainMenu: t('mainMenu', locale) }}
        />

        <main id="content">{children}</main>

        <footer className="site-footer">
          <div className="container">
            <div className="site-footer__grid">
              <div>
                <p className="site-footer__brand">
                  {logo?.url ? <img src={bestUrl(logo, 'thumbnail')} alt="" /> : null}
                  <span className="site-footer__name">{siteName}</span>
                </p>
                {settings?.footerNote ? (
                  <p className="site-footer__note">{settings.footerNote}</p>
                ) : null}
              </div>

              <nav aria-label={t('footerGroup', locale)}>
                <p className="site-footer__heading">{t('footerGroup', locale)}</p>
                <ul className="site-footer__links">
                  <li>
                    <Link href={`${base}/about`}>{t('aboutGroup', locale)}</Link>
                  </li>
                  <li>
                    <Link href={`${base}/leadership`}>{t('leadership', locale)}</Link>
                  </li>
                  <li>
                    <Link href={`${base}/companies`}>{t('companies', locale)}</Link>
                  </li>
                  {companyLinks.map((company) => (
                    <li key={company.href}>
                      <Link href={company.href}>{company.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav aria-label={t('footerActivities', locale)}>
                <p className="site-footer__heading">{t('footerActivities', locale)}</p>
                <ul className="site-footer__links">
                  <li>
                    <Link href={`${base}/products`}>{t('products', locale)}</Link>
                  </li>
                  <li>
                    <Link href={`${base}/projects`}>{t('projects', locale)}</Link>
                  </li>
                  <li>
                    <Link href={`${base}/partnerships`}>{t('partnerships', locale)}</Link>
                  </li>
                  <li>
                    <Link href={`${base}/news`}>{t('news', locale)}</Link>
                  </li>
                  <li>
                    <Link href={`${base}/gallery`}>{t('gallery', locale)}</Link>
                  </li>
                </ul>
              </nav>

              <div>
                <p className="site-footer__heading">{t('contact', locale)}</p>
                <ul className="site-footer__links">
                  {settings?.contactEmail ? (
                    <li>
                      <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
                    </li>
                  ) : null}
                  {settings?.contactPhone ? (
                    <li>
                      <a href={`tel:${settings.contactPhone.replace(/\s+/g, '')}`}>
                        {settings.contactPhone}
                      </a>
                    </li>
                  ) : null}
                  {settings?.address ? (
                    <li className="site-footer__address">{settings.address}</li>
                  ) : null}
                  <li>
                    <Link href={`${base}/contact`}>{t('writeToUs', locale)} →</Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="site-footer__bar">
              <p>
                © {new Date().getFullYear()} {siteName}. {t('allRightsReserved', locale)}
              </p>

              <nav className="site-footer__legal" aria-label={t('legalNotice', locale)}>
                <Link href={`${base}/legal-notice`}>{t('legalNotice', locale)}</Link>
                <Link href={`${base}/privacy`}>{t('privacy', locale)}</Link>
                {(settings?.social ?? []).map((entry) => (
                  <a key={entry.id ?? entry.url} href={entry.url} rel="noopener noreferrer" target="_blank">
                    {entry.network.charAt(0).toUpperCase() + entry.network.slice(1)}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
