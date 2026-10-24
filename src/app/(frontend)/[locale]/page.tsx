import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Where } from 'payload'

import { NewsletterForm } from '@/components/NewsletterForm'
import { SortSelect, type SortKey } from '@/components/SortSelect'
import { asMedia, buildSrcSet, bestUrl } from '@/lib/media'
import { Stars } from '@/components/Stars'
import { reviewStats } from '@/lib/reviews'
import {
  formatPrice,
  isLocale,
  ratingLabel,
  showingResults,
  stockStatus,
  t,
  type Locale,
} from '@/lib/locale'

// Always read the database on request, so a product published in the
// administration area appears on the public site straight away.
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 6

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

  const [settings, products] = await Promise.all([
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
  const ratings = await reviewStats(products.docs.map((product) => product.id))

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
            const rating = ratings.get(product.id)
            const soldOut = stockStatus(product.stock, product.inStock, locale).tone === 'out'

            return (
              <li key={product.id} className="product-card">
                <Link href={`/${locale}/products/${product.slug}`}>
                  <div className="product-card__media">
                    {soldOut ? <span className="product-card__badge">{t('soldOut', locale)}</span> : null}
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

                  {rating ? (
                    <p className="product-card__rating">
                      <Stars value={rating.average} label={ratingLabel(rating.average, locale)} size="sm" />
                      <span>({rating.count})</span>
                    </p>
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
