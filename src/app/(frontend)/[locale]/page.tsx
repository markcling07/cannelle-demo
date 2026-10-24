import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Where } from 'payload'

import { NewsletterForm } from '@/components/NewsletterForm'
import { SortSelect, type SortKey } from '@/components/SortSelect'
import { asMedia, buildSrcSet, bestUrl } from '@/lib/media'
import {
  formatDate,
  formatPrice,
  isLocale,
  showingResults,
  t,
  type Locale,
} from '@/lib/locale'

// Always read the database on request, so a product published in the
// administration area appears on the public site straight away.
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 6
const JOURNAL_COUNT = 6

const SORT_ORDER: Record<SortKey, string> = {
  default: '-publishedAt',
  'price-asc': 'price',
  'price-desc': '-price',
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value

export default async function CataloguePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: SearchParams
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const query = await searchParams
  const activeCategory = first(query.category) ?? null
  const sort = (first(query.sort) ?? 'default') as SortKey
  const sortKey: SortKey = sort in SORT_ORDER ? sort : 'default'
  const show = Math.max(PAGE_SIZE, Number(first(query.show)) || PAGE_SIZE)

  const payload = await getPayload({ config })

  const categories = await payload.find({
    collection: 'categories',
    locale,
    limit: 20,
    depth: 0,
    sort: 'createdAt',
  })

  const selected = activeCategory
    ? categories.docs.find((category) => category.slug === activeCategory)
    : undefined

  const conditions: Where[] = [
    // Published only — drafts stay private to the administration area.
    { _status: { equals: 'published' } },
    // Skip anything not yet translated into this language.
    { title: { exists: true } },
  ]

  if (selected) conditions.push({ category: { equals: selected.id } })

  const [settings, products, posts] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', locale, depth: 0 }),
    payload.find({
      collection: 'products',
      locale,
      depth: 1,
      limit: show,
      sort: SORT_ORDER[sortKey],
      draft: false,
      where: { and: conditions },
    }),
    payload.find({
      collection: 'posts',
      locale,
      depth: 1,
      limit: JOURNAL_COUNT,
      sort: '-publishedAt',
      draft: false,
      where: {
        and: [{ _status: { equals: 'published' } }, { title: { exists: true } }],
      },
    }),
  ])

  /** Keeps the current sort when switching category, and restarts paging. */
  const categoryHref = (slug: string | null): string => {
    const next = new URLSearchParams()
    if (slug) next.set('category', slug)
    if (sortKey !== 'default') next.set('sort', sortKey)
    const search = next.toString()
    return search ? `/${locale}?${search}` : `/${locale}`
  }

  const seeMoreHref = (): string => {
    const next = new URLSearchParams()
    if (activeCategory) next.set('category', activeCategory)
    if (sortKey !== 'default') next.set('sort', sortKey)
    next.set('show', String(show + PAGE_SIZE))
    return `/${locale}?${next.toString()}`
  }

  const hasMore = products.docs.length < products.totalDocs

  return (
    <div className="container">
      <h1 className="page-title">{t('catalogue', locale)}</h1>

      <div className="filter-bar">
        <ul className="filter-pills">
          <li>
            <Link
              href={categoryHref(null)}
              className={activeCategory ? 'pill' : 'pill is-active'}
              aria-current={activeCategory ? undefined : 'true'}
            >
              {t('allProducts', locale)}
            </Link>
          </li>

          {categories.docs.map((category) =>
            category.slug && category.title ? (
              <li key={category.id}>
                <Link
                  href={categoryHref(category.slug)}
                  className={activeCategory === category.slug ? 'pill is-active' : 'pill'}
                  aria-current={activeCategory === category.slug ? 'true' : undefined}
                >
                  {category.title}
                </Link>
              </li>
            ) : null,
          )}
        </ul>

        <div className="filter-meta">
          <span>{showingResults(products.docs.length, products.totalDocs, locale)}</span>
          <Suspense fallback={null}>
            <SortSelect current={sortKey} locale={locale} />
          </Suspense>
        </div>
      </div>

      {products.docs.length === 0 ? (
        <p className="empty">{t('noProducts', locale)}</p>
      ) : (
        <ul className="product-grid">
          {products.docs.map((product, index) => {
            const image = asMedia(product.image)
            const price = formatPrice(product.price, product.currency, locale)
            // The first row is above the fold on every screen size, so those
            // images load straight away instead of waiting for a scroll.
            const eager = index < 3

            return (
              <li key={product.id} className="product-card">
                <Link href={`/${locale}/products/${product.slug}`}>
                  <div className="product-card__media">
                    {image ? (
                      <img
                        src={bestUrl(image, 'card')}
                        srcSet={buildSrcSet(image)}
                        sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                        alt={image.alt ?? ''}
                        loading={eager ? 'eager' : 'lazy'}
                        fetchPriority={eager ? 'high' : undefined}
                        decoding="async"
                      />
                    ) : null}
                  </div>

                  <div className="product-card__row">
                    <h2 className="product-card__title">{product.title}</h2>
                    {price ? <span className="product-card__price">{price}</span> : null}
                  </div>

                  {product.shortDescription ? (
                    <p className="product-card__text">{product.shortDescription}</p>
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      {hasMore ? (
        <div className="see-more">
          <Link href={seeMoreHref()} className="btn-accent">
            {t('seeMore', locale)}
          </Link>
        </div>
      ) : null}

      {/* --- journal ------------------------------------------------------ */}
      <section className="journal" id="journal">
        <div className="journal__head">
          <h2>{t('recentPosts', locale)}</h2>
        </div>

        {posts.docs.length === 0 ? (
          <p className="empty">{t('noPosts', locale)}</p>
        ) : (
          <ul className="post-grid">
            {posts.docs.map((post) => {
              const cover = asMedia(post.coverImage)
              const avatar = asMedia(post.authorAvatar)
              const date = formatDate(post.publishedAt, locale)

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
                          loading="lazy"
                          decoding="async"
                        />
                      ) : null}
                    </div>

                    <h3 className="post-card__title">{post.title}</h3>

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
      </section>

      {/* --- newsletter --------------------------------------------------- */}
      <section className="newsletter">
        <h2 className="newsletter__heading">
          {settings?.newsletterHeading ?? t('newsletterHeading', locale)}
        </h2>
        <NewsletterForm locale={locale} />
      </section>
    </div>
  )
}
