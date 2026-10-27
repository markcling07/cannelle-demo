import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Where } from 'payload'

import { PageHeader } from '@/components/PageHeader'
import { ProductStories } from '@/components/ProductStories'
import { getGlobal, getPayloadClient, publishedIn } from '@/lib/content'
import { isLocale, t, type Locale } from '@/lib/locale'

// Always read the database on request, so a product published in the
// administration area appears on the public site straight away.
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 12

type SearchParams = Promise<Record<string, string | string[] | undefined>>

type PageProps = { params: Promise<{ locale: string }>; searchParams: SearchParams }

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  const intros = await getGlobal('section-intros', locale, 0)

  return {
    title: intros.products?.title || t('products', locale),
    description: intros.products?.intro ?? undefined,
    alternates: { canonical: `/${locale}/products` },
  }
}

/**
 * The professional catalogue, laid out like a magazine rather than a shop:
 * a category filter, then the products in blocks of varied shapes. No prices.
 */
export default async function ProductsPage({ params, searchParams }: PageProps) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const query = await searchParams
  const activeCategory = first(query.category) ?? null
  const show = Math.max(PAGE_SIZE, Number(first(query.show)) || PAGE_SIZE)

  const payload = await getPayloadClient()

  const [intros, categories] = await Promise.all([
    getGlobal('section-intros', locale, 0),
    payload.find({ collection: 'categories', locale, limit: 20, depth: 0, sort: 'createdAt' }),
  ])

  const selected = activeCategory
    ? categories.docs.find((category) => category.slug === activeCategory)
    : undefined

  const conditions: Where[] = publishedIn()
  if (selected) conditions.push({ category: { equals: selected.id } })

  const products = await payload.find({
    collection: 'products',
    locale,
    depth: 1,
    limit: show,
    sort: '-publishedAt',
    draft: false,
    where: { and: conditions },
  })

  const href = (category: string | null, count?: number): string => {
    const next = new URLSearchParams()
    if (category) next.set('category', category)
    if (count) next.set('show', String(count))
    const search = next.toString()
    return search ? `/${locale}/products?${search}` : `/${locale}/products`
  }

  return (
    <>
      <PageHeader
        title={intros.products?.title || t('products', locale)}
        intro={intros.products?.intro}
      />

      <div className="container">
        <ul className="filter-pills">
          <li>
            <Link
              href={href(null)}
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
                  href={href(category.slug)}
                  className={activeCategory === category.slug ? 'pill is-active' : 'pill'}
                  aria-current={activeCategory === category.slug ? 'true' : undefined}
                >
                  {category.title}
                </Link>
              </li>
            ) : null,
          )}
        </ul>

        {products.docs.length === 0 ? (
          <p className="empty">{t('noProducts', locale)}</p>
        ) : (
          <ProductStories products={products.docs} locale={locale} />
        )}

        {products.docs.length < products.totalDocs ? (
          <div className="see-more">
            <Link href={href(activeCategory, show + PAGE_SIZE)} className="btn btn--outline">
              {t('seeMore', locale)}
            </Link>
          </div>
        ) : null}
      </div>
    </>
  )
}
