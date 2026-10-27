import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { MediaImage } from '@/components/MediaImage'
import { PageHeader } from '@/components/PageHeader'
import { getCompanies, getGlobal } from '@/lib/content'
import { fill, isLocale, t, type Locale } from '@/lib/locale'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  const intros = await getGlobal('section-intros', locale, 0)

  return {
    title: intros.companies?.title || t('companies', locale),
    description: intros.companies?.intro ?? undefined,
    alternates: { canonical: `/${locale}/companies` },
  }
}

export default async function CompaniesPage({ params }: PageProps) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const [intros, home, companies] = await Promise.all([
    getGlobal('section-intros', locale, 0),
    getGlobal('home-page', locale, 0),
    getCompanies(locale),
  ])

  return (
    <>
      <PageHeader
        eyebrow={t('ourStructure', locale)}
        title={intros.companies?.title || t('companies', locale)}
        intro={intros.companies?.intro}
      />

      <div className="container">
        {companies.map((company, index) => (
          <article key={company.id} className="company-row">
            <div className="company-row__media">
              <MediaImage
                media={company.coverImage}
                sizes="(max-width: 900px) 100vw, 45vw"
                eager={index === 0}
              />
            </div>

            <div className="company-row__body">
              <p className="org-card__label">{t('independentCompany', locale)}</p>

              <div className="org-card__head">
                <MediaImage media={company.logo} size="thumbnail" className="org-card__logo" alt="" />
                <div>
                  <h2 className="org-card__short">{company.shortName}</h2>
                  <p className="org-card__name">{company.name}</p>
                </div>
              </div>

              {company.country ? <span className="badge badge--gold">{company.country}</span> : null}
              {company.tagline ? <p className="company-row__tagline">{company.tagline}</p> : null}
              {company.summary ? <p className="company-row__text">{company.summary}</p> : null}

              <Link href={`/${locale}/companies/${company.slug}`} className="btn btn--primary">
                {fill(t('discover', locale), { name: company.shortName })}
              </Link>
            </div>
          </article>
        ))}

        {home.structure?.note ? (
          <div className="org__note">
            <p>{home.structure.note}</p>
          </div>
        ) : null}
      </div>
    </>
  )
}
