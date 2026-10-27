import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { MediaImage } from '@/components/MediaImage'
import { ProductCard } from '@/components/ProductCard'
import { findBySlug, getPayloadClient, publishedIn, redirectToTranslation } from '@/lib/content'
import { fill, isLocale, t, type Locale } from '@/lib/locale'

export const dynamic = 'force-dynamic'

type PageParams = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale: raw, slug } = await params
  if (!isLocale(raw)) return {}

  const company = await findBySlug('companies', slug, raw, 1)
  if (!company) return {}

  // The share card comes from opengraph-image.tsx beside this file.
  return {
    title: `${company.shortName} — ${company.name}`,
    description: company.summary ?? company.tagline ?? undefined,
    alternates: { canonical: `/${raw}/companies/${company.slug}` },
  }
}

/** One of the Group's independent companies: who it is, what it offers. */
export default async function CompanyPage({ params }: PageParams) {
  const { locale: rawLocale, slug } = await params
  if (!isLocale(rawLocale)) notFound()
  const locale: Locale = rawLocale

  const company = await findBySlug('companies', slug, locale)

  if (!company) {
    if (await redirectToTranslation('companies', slug, locale, 'companies')) {
      return (
        <div className="container">
          <Link href={`/${locale}/companies`} className="back-link">
            {t('backToCompanies', locale)}
          </Link>
          <p className="empty">{t('notTranslated', locale)}</p>
        </div>
      )
    }
    notFound()
  }

  const payload = await getPayloadClient()

  const [products, projects] = await Promise.all([
    payload.find({
      collection: 'products',
      locale,
      depth: 1,
      limit: 12,
      sort: '-publishedAt',
      draft: false,
      where: { and: [...publishedIn(), { company: { equals: company.id } }] },
    }),
    payload.find({
      collection: 'projects',
      locale,
      depth: 1,
      limit: 6,
      sort: 'order',
      draft: false,
      where: { and: [...publishedIn(), { company: { equals: company.id } }] },
    }),
  ])

  const legal = company.legal ?? {}
  const legalRows = [
    { label: t('legalName', locale), value: legal.legalName },
    { label: t('legalForm', locale), value: legal.legalForm },
    { label: t('registration', locale), value: legal.registration },
    { label: t('registeredAddress', locale), value: legal.registeredAddress },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value))

  const facts = company.keyFacts ?? []

  return (
    <>
      <section className="company-hero">
        <MediaImage media={company.coverImage} size="hero" sizes="100vw" className="hero__img" eager />

        <div className="container company-hero__inner">
          <Link href={`/${locale}/companies`} className="back-link">
            {t('backToCompanies', locale)}
          </Link>

          <div className="org-card__head">
            <MediaImage media={company.logo} size="thumbnail" className="org-card__logo" alt="" />
            <div>
              <p className="eyebrow eyebrow--light">
                {t('independentCompany', locale)}
                {company.country ? ` · ${company.country}` : ''}
              </p>
              <p className="org-card__name">{company.name}</p>
            </div>
          </div>

          <h1 className="company-hero__title">{company.shortName}</h1>
          {company.tagline ? <p className="company-hero__tagline">{company.tagline}</p> : null}
        </div>
      </section>

      <div className="container section">
        <div className="split split--aside">
          <div>
            {company.summary ? <p className="article__lead">{company.summary}</p> : null}
            {company.description ? (
              <div className="rich-text">
                <RichText data={company.description} />
              </div>
            ) : null}
          </div>

          <aside>
            {facts.length > 0 ? (
              <section className="aside-card spec">
                <h2>{t('keyFacts', locale)}</h2>
                <dl>
                  {facts.map((fact) => (
                    <div key={fact.id ?? fact.label} className="spec__row">
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            {legalRows.length > 0 ? (
              <section className="aside-card spec">
                <h2>{t('legalDetails', locale)}</h2>
                <dl>
                  {legalRows.map((row) => (
                    <div key={row.label} className="spec__row">
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            <section className="aside-card spec">
              <h2>{t('contact', locale)}</h2>
              <ul className="contact-lines">
                {company.email ? (
                  <li>
                    <a href={`mailto:${company.email}`}>{company.email}</a>
                  </li>
                ) : null}
                {company.phone ? <li>{company.phone}</li> : null}
                {company.address ? <li className="address">{company.address}</li> : null}
                {company.website ? (
                  <li>
                    <a href={company.website} target="_blank" rel="noopener noreferrer">
                      {t('visitWebsite', locale)} ↗
                    </a>
                  </li>
                ) : null}
              </ul>
              <p className="aside-card__action">
                <Link href={`/${locale}/contact`} className="btn btn--primary">
                  {fill(t('contactCompany', locale), { name: company.shortName })}
                </Link>
              </p>
            </section>
          </aside>
        </div>
      </div>

      {products.docs.length > 0 ? (
        <section className="section section--cream" aria-labelledby="company-products">
          <div className="container">
            <div className="section__head">
              <h2 id="company-products" className="section__title">
                {t('companyProducts', locale)}
              </h2>
              <Link href={`/${locale}/products`} className="section__link">
                {t('seeAll', locale)}
              </Link>
            </div>
            <ul className="product-grid">
              {products.docs.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {projects.docs.length > 0 ? (
        <section className="section" aria-labelledby="company-projects">
          <div className="container">
            <div className="section__head">
              <h2 id="company-projects" className="section__title">
                {t('companyProjects', locale)}
              </h2>
              <Link href={`/${locale}/projects`} className="section__link">
                {t('seeAll', locale)}
              </Link>
            </div>
            <ul className="card-grid">
              {projects.docs.map((project) => (
                <li key={project.id}>
                  <Link href={`/${locale}/projects/${project.slug}`} className="card__link">
                    <div className="card__media">
                      <MediaImage media={project.coverImage} sizes="(max-width: 900px) 100vw, 33vw" />
                    </div>
                    <h3 className="card__title">{project.title}</h3>
                    {project.summary ? <p className="card__text">{project.summary}</p> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  )
}
