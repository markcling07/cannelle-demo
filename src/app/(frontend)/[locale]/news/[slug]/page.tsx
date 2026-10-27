import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { MediaImage } from '@/components/MediaImage'
import { findBySlug, redirectToTranslation } from '@/lib/content'
import { asMedia, bestUrl } from '@/lib/media'
import { formatDate, isLocale, t, type Locale } from '@/lib/locale'

export const dynamic = 'force-dynamic'

type PageParams = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale: raw, slug } = await params
  if (!isLocale(raw)) return {}

  const post = await findBySlug('posts', slug, raw)
  if (!post?.title) return {}

  const cover = asMedia(post.coverImage)

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/${raw}/news/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt ?? undefined,
      publishedTime: post.publishedAt ?? undefined,
      images: cover ? [{ url: bestUrl(cover, 'hero') }] : undefined,
    },
  }
}

export default async function NewsItemPage({ params }: PageParams) {
  const { locale: rawLocale, slug } = await params
  if (!isLocale(rawLocale)) notFound()
  const locale: Locale = rawLocale

  const post = await findBySlug('posts', slug, locale)

  if (!post?.title) {
    if (await redirectToTranslation('posts', slug, locale, 'news')) {
      return (
        <div className="container">
          <Link href={`/${locale}/news`} className="back-link">
            {t('backToNews', locale)}
          </Link>
          <p className="empty">{t('notTranslated', locale)}</p>
        </div>
      )
    }
    notFound()
  }

  const date = formatDate(post.publishedAt, locale)

  return (
    <div className="container">
      <Link href={`/${locale}/news`} className="back-link">
        {t('backToNews', locale)}
      </Link>

      <article className="article">
        <h1 className="article__title">{post.title}</h1>

        {post.excerpt ? <p className="article__lead">{post.excerpt}</p> : null}

        <p className="byline">
          <MediaImage media={post.authorAvatar} size="thumbnail" className="byline__avatar" alt="" />
          <span>{post.authorName}</span>
          {date ? (
            <>
              <span className="byline__dot">•</span>
              <span className="byline__date">{date}</span>
            </>
          ) : null}
        </p>

        <div className="article__media">
          <MediaImage media={post.coverImage} size="hero" sizes="(max-width: 800px) 100vw, 760px" eager />
        </div>

        {post.content ? (
          <div className="rich-text">
            <RichText data={post.content} />
          </div>
        ) : null}
      </article>
    </div>
  )
}
