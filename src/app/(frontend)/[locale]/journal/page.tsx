import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { NewsletterForm } from '@/components/NewsletterForm'
import { asMedia, buildSrcSet, bestUrl } from '@/lib/media'
import { formatDate, isLocale, t, type Locale } from '@/lib/locale'

// Same as the catalogue: read on request so a newly published article shows
// up straight away.
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 9

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

  const hasMore = posts.docs.length < posts.totalDocs

  return (
    <div className="container">
      <h1 className="page-title">{t('journal', locale)}</h1>

      {posts.docs.length === 0 ? (
        <p className="empty">{t('noPosts', locale)}</p>
      ) : (
        <ul className="post-grid">
          {posts.docs.map((post, index) => {
            const cover = asMedia(post.coverImage)
            const avatar = asMedia(post.authorAvatar)
            const date = formatDate(post.publishedAt, locale)
            // First row is above the fold, as on the catalogue.
            const eager = index < 3

            return (
              <li key={post.id} className="post-card">
                <Link href={`/${locale}/journal/${post.slug}`}>
                  <div className="post-card__media">
                    {cover ? (
                      <img
                        src={bestUrl(cover, 'card')}
                        srcSet={buildSrcSet(cover)}
                        sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                        alt={cover.alt ?? ''}
                        loading={eager ? 'eager' : 'lazy'}
                        fetchPriority={eager ? 'high' : undefined}
                        decoding="async"
                      />
                    ) : null}
                  </div>

                  <h2 className="post-card__title">{post.title}</h2>

                  {post.excerpt ? <p className="post-card__text">{post.excerpt}</p> : null}

                  <p className="byline">
                    {avatar ? (
                      <img
                        className="byline__avatar"
                        src={bestUrl(avatar, 'thumbnail')}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                    <span>{post.authorName}</span>
                    {date ? (
                      <>
                        <span className="byline__dot">•</span>
                        <span className="byline__date">{date}</span>
                      </>
                    ) : null}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      {hasMore ? (
        <div className="see-more">
          <Link href={`/${locale}/journal?show=${show + PAGE_SIZE}`} className="btn-accent">
            {t('seeMore', locale)}
          </Link>
        </div>
      ) : null}

      <section className="newsletter">
        <h2 className="newsletter__heading">
          {settings?.newsletterHeading ?? t('newsletterHeading', locale)}
        </h2>
        <NewsletterForm locale={locale} />
      </section>
    </div>
  )
}
