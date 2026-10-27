import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import type { Partner } from '@/payload-types'
import { MediaImage } from '@/components/MediaImage'
import { PageHeader } from '@/components/PageHeader'
import { getGlobal, getPayloadClient } from '@/lib/content'
import { PARTNER_TYPE_KEYS, isLocale, t, type Locale } from '@/lib/locale'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  const intros = await getGlobal('section-intros', locale, 0)

  return {
    title: intros.partnerships?.title || t('partnerships', locale),
    description: intros.partnerships?.intro ?? undefined,
    alternates: { canonical: `/${locale}/partnerships` },
  }
}

/** Partners grouped by type: growers first, then logistics, laboratories… */
export default async function PartnershipsPage({ params }: PageProps) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const payload = await getPayloadClient()

  const [intros, partners] = await Promise.all([
    getGlobal('section-intros', locale, 0),
    payload.find({ collection: 'partners', locale, depth: 1, limit: 100, sort: 'order' }),
  ])

  const groups = (Object.keys(PARTNER_TYPE_KEYS) as Partner['type'][])
    .map((type) => ({ type, partners: partners.docs.filter((partner) => partner.type === type) }))
    .filter((group) => group.partners.length > 0)

  return (
    <>
      <PageHeader
        title={intros.partnerships?.title || t('partnerships', locale)}
        intro={intros.partnerships?.intro}
      />

      <div className="container">
        {groups.map((group) => (
          <section key={group.type} className="partner-group" aria-labelledby={`partners-${group.type}`}>
            <h2 id={`partners-${group.type}`} className="partner-group__title">
              {t(PARTNER_TYPE_KEYS[group.type], locale)}
            </h2>

            <ul className="card-grid">
              {group.partners.map((partner) => (
                <li key={partner.id}>
                  <article className="partner">
                    <MediaImage media={partner.logo} size="thumbnail" className="partner__logo" alt="" />
                    <div>
                      <h3 className="partner__name">{partner.name}</h3>
                      {partner.country ? <p className="partner__country">{partner.country}</p> : null}
                      {partner.description ? <p className="partner__text">{partner.description}</p> : null}
                      {partner.website ? (
                        <a
                          href={partner.website}
                          className="partner__link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t('visitWebsite', locale)} ↗
                        </a>
                      ) : null}
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="section section--green">
        <div className="container cta-band">
          <h2 className="cta-band__title">{t('becomePartner', locale)}</h2>
          <div className="btn-row">
            <Link href={`/${locale}/contact?type=partnership`} className="btn btn--gold">
              {t('contactTeam', locale)}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
