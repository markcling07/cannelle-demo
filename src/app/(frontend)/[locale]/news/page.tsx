import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import type { Post } from '@/payload-types'
import { Arrow } from '@/components/Arrow'
import { MediaImage } from '@/components/MediaImage'
import { NewsletterForm } from '@/components/NewsletterForm'
import { PageHeader } from '@/components/PageHeader'
import { getGlobal, getPayloadClient, publishedIn } from '@/lib/content'
import { formatDate, isLocale, t, type Locale } from '@/lib/locale'

// Read on request so a newly published item shows up straight away.
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 12

type SearchParams = Promise<Record<string, string | string[] | undefined>>

type PageProps = {
  params: Promise<{ locale: string }>
  searchParams: SearchParams
}

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  const intros = await getGlobal('section-intros', locale, 0)

  return {
    title: intros.news?.title || t('news', locale),
    description: intros.news?.intro ?? undefined,
    alternates: { canonical: `/${locale}/news` },
  }
}

/**
 * News, laid out as a magazine front page: the latest item as a full-width
 * photograph, an introduction with the next two, a featured item, then every
 * item in a numbered index.
 */
export default async function NewsPage({ params, searchParams }: PageProps) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const query = await searchParams
  const show = Math.max(PAGE_SIZE, Number(first(query.show)) || PAGE_SIZE)

  const payload = await getPayloadClient()

  const [settings, intros, posts] = await Promise.all([
    getGlobal('site-settings', locale),
    getGlobal('section-intros', locale, 0),
    payload.find({
      collection: 'posts',
      locale,
      depth: 1,
      limit: show,
      sort: '-publishedAt',
      draft: false,
      where: { and: publishedIn() },
    }),
  ])

  const title = intros.news?.title || t('news', locale)

  if (posts.docs.length === 0) {
    return (
      <>
        <PageHeader title={title} intro={intros.news?.intro} />
        <div className="container">
          <p className="empty">{t('noPosts', locale)}</p>
        </div>
      </>
    )
  }

  const [lead, ...rest] = posts.docs
  const companions = rest.slice(0, 2)
  const feature: Post | undefined = rest[2]
  const hasMore = posts.docs.length < posts.totalDocs

  const href = (post: Post) => `/${locale}/news/${post.slug}`

  return (
    <>
      {/* --- latest item, full width ----------------------------------------- */}
      <section className="jhero">
        <MediaImage media={lead.coverImage} size="hero" sizes="100vw" className="jhero__img" eager />

        <div className="container jhero__inner">
          <div className="jhero__text">
            <h1 className="jhero__eyebrow">
              {title} — {t('latestArticle', locale)}
            </h1>
            <h2 className="jhero__title">
              <Link href={href(lead)}>{lead.title}</Link>
            </h2>
            <Link href={href(lead)} className="btn-arrow">
              {t('readArticle', locale)}
              <Arrow />
            </Link>
          </div>

          <a href="#news-intro" className="jhero__explore">
            {t('explore', locale)}
            <Arrow down />
          </a>
        </div>
      </section>

      {/* --- introduction and the next two items ------------------------------ */}
      <section id="news-intro" className="container jintro">
        <p className="eyebrow">{title}</p>

        {intros.news?.statement ? (
          <h2 className="statement">
            {intros.news.statement}{' '}
            {intros.news.accent ? <span className="statement__accent">{intros.news.accent}</span> : null}
          </h2>
        ) : null}

        <div className="jintro__grid">
          {companions.map((post) => (
            <Link key={post.id} href={href(post)} className="jcard">
              <div className="jcard__media">
                <MediaImage media={post.coverImage} sizes="(max-width: 900px) 100vw, 30vw" />
              </div>
              <p className="jcard__title">{post.title}</p>
            </Link>
          ))}

          <div className="jintro__aside">
            {intros.news?.intro ? <p>{intros.news.intro}</p> : null}
            <Link href={`/${locale}/companies`} className="btn-arrow">
              {t('companies', locale)}
              <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* --- featured item, full width ---------------------------------------- */}
      {feature ? (
        <section className="jfeature">
          <MediaImage media={feature.coverImage} size="hero" sizes="100vw" className="jfeature__img" />

          <div className="container jfeature__inner">
            <div className="jfeature__panel">
              <p className="eyebrow eyebrow--light">{t('featured', locale)}</p>
              <h2 className="jfeature__title">
                <Link href={href(feature)}>{feature.title}</Link>
              </h2>
              {feature.excerpt ? <p className="jfeature__excerpt">{feature.excerpt}</p> : null}
              <Link href={href(feature)} className="btn-arrow">
                {t('readArticle', locale)}
                <Arrow />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* --- every item, numbered --------------------------------------------- */}
      <section id="all-news" className="jindex">
        <div className="container">
          <div className="jindex__head">
            <h2 className="jindex__title">{t('allArticles', locale)}</h2>
            <p className="eyebrow eyebrow--light">{title}</p>
          </div>

          <ol className="jindex__grid">
            {posts.docs.map((post, index) => {
              const date = formatDate(post.publishedAt, locale)

              return (
                <li key={post.id} className="jindex__cell">
                  <Link href={href(post)} className="jindex__link">
                    <span className="jindex__number">{String(index + 1).padStart(2, '0')}</span>
                    <MediaImage media={post.coverImage} size="thumbnail" className="jindex__thumb" alt="" />
                    <h3 className="jindex__name">{post.title}</h3>
                    <p className="jindex__meta">
                      {post.authorName}
                      {date ? ` · ${date}` : null}
                    </p>
                  </Link>
                </li>
              )
            })}

            <li className="jindex__cell jindex__cell--cta">
              <p>{t('newsNewsletterPrompt', locale)}</p>
              <a href="#newsletter" className="btn-arrow">
                {t('subscribe', locale)}
                <Arrow />
              </a>
            </li>
          </ol>

          {hasMore ? (
            <div className="see-more">
              <Link href={`/${locale}/news?show=${show + PAGE_SIZE}#all-news`} className="btn-arrow">
                {t('seeMore', locale)}
                <Arrow down />
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <div className="container">
        <section id="newsletter" className="newsletter">
          <h2 className="newsletter__heading">
            {settings?.newsletterHeading || t('newsletterHeading', locale)}
          </h2>
          <NewsletterForm locale={locale} />
        </section>
      </div>
    </>
  )
}
