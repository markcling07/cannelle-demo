import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { Post } from '@/payload-types'
import { asMedia, buildSrcSet, bestUrl } from '@/lib/media'
import { formatDate, isLocale, otherLocale, t, type Locale } from '@/lib/locale'

export const dynamic = 'force-dynamic'

type PageParams = { params: Promise<{ locale: string; slug: string }> }

const findBySlug = async (slug: string, locale: Locale): Promise<Post | null> => {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'posts',
    locale,
    depth: 2,
    limit: 1,
    draft: false,
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
  })

  return result.docs[0] ?? null
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale: raw, slug } = await params
  if (!isLocale(raw)) return {}

  const post = await findBySlug(slug, raw)
  if (!post?.title) return {}

  const cover = asMedia(post.coverImage)

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/${raw}/journal/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt ?? undefined,
      publishedTime: post.publishedAt ?? undefined,
      images: cover ? [{ url: bestUrl(cover, 'hero') }] : undefined,
    },
  }
}

export default async function ArticlePage({ params }: PageParams) {
  const { locale: rawLocale, slug } = await params
  if (!isLocale(rawLocale)) notFound()
  const locale: Locale = rawLocale

  const post = await findBySlug(slug, locale)

  // Same cross-language address handling as the product pages.
  if (!post) {
    const counterpart = await findBySlug(slug, otherLocale(locale))

    if (counterpart) {
      const payload = await getPayload({ config })

      const translated = await payload
        .findByID({ collection: 'posts', id: counterpart.id, locale, depth: 0, draft: false })
        .catch(() => null)

      if (translated?.slug && translated.slug !== slug) {
        redirect(`/${locale}/journal/${translated.slug}`)
      }

      return (
        <div className="container">
          <Link href={`/${locale}#journal`} className="back-link">
            {t('backToJournal', locale)}
          </Link>
          <p className="empty">{t('notTranslated', locale)}</p>
        </div>
      )
    }

    notFound()
  }

  const cover = asMedia(post.coverImage)
  const avatar = asMedia(post.authorAvatar)
  const date = formatDate(post.publishedAt, locale)

  return (
    <div className="container">
      <Link href={`/${locale}#journal`} className="back-link">
        {t('backToJournal', locale)}
      </Link>

      <article className="article">
        <h1 className="article__title">{post.title}</h1>

        {post.excerpt ? <p className="article__lead">{post.excerpt}</p> : null}

        <p className="byline">
          {avatar ? (
            <img className="byline__avatar" src={bestUrl(avatar, 'thumbnail')} alt="" />
          ) : null}
          <span>{post.authorName}</span>
          {date ? (
            <>
              <span className="byline__dot">•</span>
              <span className="byline__date">{date}</span>
            </>
          ) : null}
        </p>

        {cover ? (
          <div className="article__media">
            <img
              src={bestUrl(cover, 'hero')}
              srcSet={buildSrcSet(cover)}
              sizes="(max-width: 760px) 100vw, 720px"
              alt={cover.alt ?? ''}
            />
          </div>
        ) : null}

        {post.content ? (
          <div className="rich-text">
            <RichText data={post.content} />
          </div>
        ) : null}
      </article>
    </div>
  )
}
