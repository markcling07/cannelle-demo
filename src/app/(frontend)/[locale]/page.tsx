import type { CSSProperties } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import type { Product } from '@/payload-types'
import { Arrow } from '@/components/Arrow'
import { MediaImage } from '@/components/MediaImage'
import { ProductCard } from '@/components/ProductCard'
import { getCompanies, getGlobal, getPayloadClient, publishedIn } from '@/lib/content'
import { asMedia } from '@/lib/media'
import { fill, formatDate, isLocale, t, type Locale } from '@/lib/locale'

// Read on every request, so a change saved in the administration area shows
// up straight away.
export const dynamic = 'force-dynamic'

const isPublishedProduct = (value: number | Product): value is Product =>
  typeof value === 'object' && value._status === 'published' && Boolean(value.title)

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw
  const base = `/${locale}`

  const payload = await getPayloadClient()

  const [home, settings, companies, news, partners] = await Promise.all([
    getGlobal('home-page', locale, 2),
    getGlobal('site-settings', locale),
    getCompanies(locale),
    payload.find({
      collection: 'posts',
      locale,
      depth: 1,
      limit: 3,
      sort: '-publishedAt',
      draft: false,
      where: { and: publishedIn() },
    }),
    payload.find({ collection: 'partners', locale, depth: 1, limit: 8, sort: 'order' }),
  ])

  // The products chosen on the home page, or the latest ones if none are.
  let featured = (home.featuredProducts ?? []).filter(isPublishedProduct)
  if (featured.length === 0) {
    const latest = await payload.find({
      collection: 'products',
      locale,
      depth: 2,
      limit: 3,
      sort: '-publishedAt',
      draft: false,
      where: { and: publishedIn() },
    })
    featured = latest.docs
  }

  const logo = asMedia(settings?.logo)
  const siteName = settings?.siteName ?? 'GROUPE JAOVAZAHA'

  return (
    <>
      {/* --- hero ---------------------------------------------------------- */}
      <section className="hero">
        <MediaImage media={home.hero?.image} size="hero" sizes="100vw" className="hero__img" eager />

        <div className="container hero__inner">
          {home.hero?.eyebrow ? <p className="eyebrow eyebrow--light">{home.hero.eyebrow}</p> : null}
          <h1 className="hero__title">{home.hero?.title || siteName}</h1>
          {home.hero?.text ? <p className="hero__text">{home.hero.text}</p> : null}

          <div className="btn-row">
            <Link href={`${base}/about`} className="btn btn--gold">
              {t('aboutGroup', locale)}
            </Link>
            <Link href={`${base}/products`} className="btn btn--light">
              {t('products', locale)}
            </Link>
          </div>
        </div>
      </section>

      {/* --- the Group above its companies --------------------------------- */}
      <section className="section" aria-labelledby="structure-title">
        <div className="container">
          <div className="section__head">
            <div>
              <p className="eyebrow">{t('ourStructure', locale)}</p>
              <h2 id="structure-title" className="section__title">
                {home.structure?.title || t('companies', locale)}
              </h2>
              {home.structure?.text ? <p className="section__intro">{home.structure.text}</p> : null}
            </div>
          </div>

          <div className="org">
            <div className="org__root">
              {logo?.url ? <img src={logo.url} alt="" /> : null}
              <p className="org__root-name">{siteName}</p>
              <p className="org__root-label">{t('umbrellaBrand', locale)}</p>
            </div>

            <ul className="org__children" style={{ '--count': companies.length + 1 } as CSSProperties}>
              {companies.map((company) => (
                <li key={company.id} className="org__child">
                  <article className="org-card">
                    <p className="org-card__label">{t('independentCompany', locale)}</p>

                    <div className="org-card__head">
                      <MediaImage media={company.logo} size="thumbnail" className="org-card__logo" alt="" />
                      <div>
                        <h3 className="org-card__short">{company.shortName}</h3>
                        <p className="org-card__name">{company.name}</p>
                      </div>
                    </div>

                    {company.country ? (
                      <p className="org-card__country">
                        <span className="badge badge--gold">{company.country}</span>
                      </p>
                    ) : null}

                    {company.summary ? <p className="org-card__text">{company.summary}</p> : null}

                    <Link href={`${base}/companies/${company.slug}`} className="section__link">
                      {fill(t('discover', locale), { name: company.shortName })}
                    </Link>
                  </article>
                </li>
              ))}

              <li className="org__child">
                <div className="org-card org-card--future">
                  <p className="org-card__label">{siteName}</p>
                  <h3 className="org-card__short">{t('futureProjects', locale)}</h3>
                  <p className="org-card__text">{t('futureProjectsText', locale)}</p>
                  <Link href={`${base}/projects`} className="section__link">
                    {t('projects', locale)}
                  </Link>
                </div>
              </li>
            </ul>

            {home.structure?.note ? (
              <div className="org__note">
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
                  <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10 9v5M10 6.2v.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <p>{home.structure.note}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* --- featured products --------------------------------------------- */}
      {featured.length > 0 ? (
        <section className="section section--cream" aria-labelledby="products-title">
          <div className="container">
            <div className="section__head">
              <h2 id="products-title" className="section__title">
                {t('featuredProducts', locale)}
              </h2>
              <Link href={`${base}/products`} className="section__link">
                {t('seeAll', locale)}
              </Link>
            </div>

            <ul className="product-grid">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* --- latest news ---------------------------------------------------- */}
      {news.docs.length > 0 ? (
        <section className="section" aria-labelledby="news-title">
          <div className="container">
            <div className="section__head">
              <h2 id="news-title" className="section__title">
                {t('latestNews', locale)}
              </h2>
              <Link href={`${base}/news`} className="section__link">
                {t('allArticles', locale)}
              </Link>
            </div>

            <ul className="card-grid">
              {news.docs.map((post) => (
                <li key={post.id}>
                  <Link href={`${base}/news/${post.slug}`} className="card__link">
                    <div className="card__media">
                      <MediaImage media={post.coverImage} sizes="(max-width: 900px) 100vw, 33vw" />
                    </div>
                    <p className="card__eyebrow">{formatDate(post.publishedAt, locale)}</p>
                    <h3 className="card__title">{post.title}</h3>
                    {post.excerpt ? <p className="card__text">{post.excerpt}</p> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* --- partners -------------------------------------------------------- */}
      {partners.docs.length > 0 ? (
        <section className="section section--cream" aria-labelledby="partners-title">
          <div className="container">
            <div className="section__head">
              <h2 id="partners-title" className="section__title">
                {t('ourPartners', locale)}
              </h2>
              <Link href={`${base}/partnerships`} className="section__link">
                {t('partnerships', locale)}
              </Link>
            </div>

            <ul className="partner-strip">
              {partners.docs.map((partner) => (
                <li key={partner.id}>
                  <MediaImage media={partner.logo} size="thumbnail" alt="" />
                  <span>{partner.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* --- contact ---------------------------------------------------------- */}
      <section className="section section--green">
        <div className="container cta-band">
          <div>
            <h2 className="cta-band__title">{home.closing?.title || t('contact', locale)}</h2>
            {home.closing?.text ? <p className="cta-band__text">{home.closing.text}</p> : null}
          </div>

          <div className="btn-row">
            <Link href={`${base}/contact?type=quote`} className="btn btn--gold">
              {t('requestQuote', locale)}
            </Link>
            <Link href={`${base}/contact`} className="btn-arrow">
              {t('contactTeam', locale)}
              <Arrow />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
