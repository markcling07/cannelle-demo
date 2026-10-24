import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import type { Post } from '@/payload-types'
import { NewsletterForm } from '@/components/NewsletterForm'
import { asMedia, buildSrcSet, bestUrl } from '@/lib/media'
import { formatDate, isLocale, t, type Locale } from '@/lib/locale'

// Same as the catalogue: read on request so a newly published article shows
// up straight away.
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

  return {
    title: t('journal', locale),
    alternates: { canonical: `/${locale}/journal` },
  }
}

/** The round arrow at the end of every pill button. */
function Arrow({ down = false }: { down?: boolean }) {
  return (
    <span className="btn-arrow__icon" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="12" height="12">
        <path
          d={down ? 'M8 3v10M3.5 8.5 8 13l4.5-4.5' : 'M3 8h10M8.5 3.5 13 8l-4.5 4.5'}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

/**
 * The journal, laid out as a magazine front page: the latest article as a
 * full-width photograph, an introduction with the next two, a featured
 * article, then every article in a numbered index. Photographs only.
 */
export default async function JournalPage({ params, searchParams }: PageProps) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const query = await searchParams
  const show = Math.max(PAGE_SIZE, Number(first(query.show)) || PAGE_SIZE)

  const payload = await getPayload({ config })

  const [settings, posts] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', locale, depth: 0 }),
    payload.find({
      collection: 'posts',
      locale,
      depth: 1,
      limit: show,
      sort: '-publishedAt',
      draft: false,
      where: {
        // Published only, and skip anything not yet translated into this language.
        and: [{ _status: { equals: 'published' } }, { title: { exists: true } }],
      },
    }),
  ])

  if (posts.docs.length === 0) {
    return (
      <div className="container">
        <h1 className="page-title">{t('journal', locale)}</h1>
        <p className="empty">{t('noPosts', locale)}</p>
      </div>
    )
  }

  const [lead, ...rest] = posts.docs
  const companions = rest.slice(0, 2)
  const feature: Post | undefined = rest[2]
  const hasMore = posts.docs.length < posts.totalDocs

  const href = (post: Post) => `/${locale}/journal/${post.slug}`
  const leadCover = asMedia(lead.coverImage)
  const featureCover = feature ? asMedia(feature.coverImage) : null

  return (
    <>
      {/* --- latest article, full width --------------------------------- */}
      <section className="jhero">
        {leadCover ? (
          <img
            className="jhero__img"
            src={bestUrl(leadCover, 'hero')}
            srcSet={buildSrcSet(leadCover)}
            sizes="100vw"
            alt={leadCover.alt ?? ''}
            fetchPriority="high"
          />
        ) : null}

        <div className="container jhero__inner">
          <div className="jhero__text">
            <h1 className="jhero__eyebrow">
              {t('journal', locale)} — {t('latestArticle', locale)}
            </h1>
            <h2 className="jhero__title">
              <Link href={href(lead)}>{lead.title}</Link>
            </h2>
            <Link href={href(lead)} className="btn-arrow">
              {t('readArticle', locale)}
              <Arrow />
            </Link>
          </div>

          <a href="#journal-intro" className="jhero__explore">
            {t('explore', locale)}
            <Arrow down />
          </a>
        </div>
      </section>

      {/* --- introduction and the next two articles ---------------------- */}
      <section id="journal-intro" className="container jintro">
        <p className="eyebrow">{t('journal', locale)}</p>

        <h2 className="statement">
          {settings?.journalStatement || t('journalStatement', locale)}{' '}
          <span className="statement__accent">
            {settings?.journalAccent || t('journalAccent', locale)}
          </span>
        </h2>

        <div className="jintro__grid">
          {companions.map((post) => {
            const cover = asMedia(post.coverImage)

            return (
              <Link key={post.id} href={href(post)} className="jcard">
                <div className="jcard__media">
                  {cover ? (
                    <img
                      src={bestUrl(cover, 'card')}
                      srcSet={buildSrcSet(cover)}
                      sizes="(max-width: 900px) 100vw, 30vw"
                      alt={cover.alt ?? ''}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                </div>
                <p className="jcard__title">{post.title}</p>
              </Link>
            )
          })}

          <div className="jintro__aside">
            <p>{settings?.journalIntro || t('journalIntro', locale)}</p>
            <Link href={`/${locale}`} className="btn-arrow">
              {t('viewCatalogue', locale)}
              <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* --- featured article, full width -------------------------------- */}
      {feature ? (
        <section className="jfeature">
          {featureCover ? (
            <img
              className="jfeature__img"
              src={bestUrl(featureCover, 'hero')}
              srcSet={buildSrcSet(featureCover)}
              sizes="100vw"
              alt={featureCover.alt ?? ''}
              loading="lazy"
              decoding="async"
            />
          ) : null}

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

      {/* --- every article, numbered ------------------------------------- */}
      <section id="articles" className="jindex">
        <div className="container">
          <div className="jindex__head">
            <h2 className="jindex__title">{t('allArticles', locale)}</h2>
            <p className="eyebrow eyebrow--light">{t('journal', locale)}</p>
          </div>

          <ol className="jindex__grid">
            {posts.docs.map((post, index) => {
              const cover = asMedia(post.coverImage)
              const date = formatDate(post.publishedAt, locale)

              return (
                <li key={post.id} className="jindex__cell">
                  <Link href={href(post)} className="jindex__link">
                    <span className="jindex__number">{String(index + 1).padStart(2, '0')}</span>
                    {cover ? (
                      <img
                        className="jindex__thumb"
                        src={bestUrl(cover, 'thumbnail')}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
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
              <p>{t('journalNewsletterPrompt', locale)}</p>
              <a href="#newsletter" className="btn-arrow">
                {t('subscribe', locale)}
                <Arrow />
              </a>
            </li>
          </ol>

          {hasMore ? (
            <div className="see-more">
              <Link
                href={`/${locale}/journal?show=${show + PAGE_SIZE}#articles`}
                className="btn-arrow"
              >
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
            {settings?.newsletterHeading ?? t('newsletterHeading', locale)}
          </h2>
          <NewsletterForm locale={locale} />
        </section>
      </div>
    </>
  )
}
