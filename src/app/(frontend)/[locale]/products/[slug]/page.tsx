import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { Category, Company } from '@/payload-types'
import { ProductGallery, type GalleryImage } from '@/components/ProductGallery'
import { findBySlug, redirectToTranslation } from '@/lib/content'
import { asMedia, buildSrcSet, bestUrl } from '@/lib/media'
import { isLocale, t, type Locale } from '@/lib/locale'

export const dynamic = 'force-dynamic'

type PageParams = { params: Promise<{ locale: string; slug: string }> }

const asDoc = <T extends object>(value: number | T | null | undefined): T | null =>
  value && typeof value === 'object' ? value : null

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale: raw, slug } = await params
  if (!isLocale(raw)) return {}

  const product = await findBySlug('products', slug, raw)
  if (!product?.title) return {}

  // The share card comes from opengraph-image.tsx beside this file.
  return {
    title: product.title,
    description: product.shortDescription ?? undefined,
    alternates: { canonical: `/${raw}/products/${product.slug}` },
  }
}

/**
 * A catalogue page: photographs, description and technical information, then
 * the ways to get in touch — no price, no basket.
 */
export default async function ProductPage({ params }: PageParams) {
  const { locale: rawLocale, slug } = await params
  if (!isLocale(rawLocale)) notFound()
  const locale: Locale = rawLocale

  const product = await findBySlug('products', slug, locale)

  if (!product?.title) {
    if (await redirectToTranslation('products', slug, locale, 'products')) {
      return (
        <div className="container">
          <Link href={`/${locale}/products`} className="back-link">
            {t('backToProducts', locale)}
          </Link>
          <p className="empty">{t('notTranslated', locale)}</p>
        </div>
      )
    }
    notFound()
  }

  const category = asDoc<Category>(product.category)
  const company = asDoc<Company>(product.company)
  const extras = Array.isArray(product.gallery)
    ? product.gallery.map(asMedia).filter((m): m is NonNullable<typeof m> => Boolean(m))
    : []

  // The main photograph first, then the gallery — one set to step through.
  const images: GalleryImage[] = [asMedia(product.image), ...extras]
    .filter((media): media is NonNullable<typeof media> => Boolean(media))
    .map((media) => ({
      url: bestUrl(media, 'hero'),
      srcSet: buildSrcSet(media),
      thumbUrl: bestUrl(media, 'thumbnail'),
      alt: media.alt ?? '',
    }))

  const enquiryHref = `/${locale}/contact?type=quote&product=${encodeURIComponent(product.slug ?? '')}`

  return (
    <div className="container">
      <Link href={`/${locale}/products`} className="back-link">
        {t('backToProducts', locale)}
      </Link>

      <article className="detail">
        <div>
          <ProductGallery
            images={images}
            labels={{
              previous: t('previousImage', locale),
              next: t('nextImage', locale),
              group: t('productPhotos', locale),
            }}
          />
        </div>

        <div>
          {category?.title ? <p className="eyebrow">{category.title}</p> : null}
          <h1 className="detail__title">{product.title}</h1>

          {product.shortDescription ? (
            <p className="detail__lead">{product.shortDescription}</p>
          ) : null}

          {company ? (
            <p className="detail__supplier">
              {t('suppliedBy', locale)}
              <Link href={`/${locale}/companies/${company.slug}`}>
                {company.shortName} — {company.name}
              </Link>
            </p>
          ) : null}

          <div className="enquire">
            <div className="btn-row">
              <Link href={enquiryHref} className="btn btn--primary">
                {t('requestQuote', locale)}
              </Link>
              <Link href={`/${locale}/contact`} className="btn btn--outline">
                {t('contactTeam', locale)}
              </Link>
              {product.shopUrl ? (
                <a href={product.shopUrl} className="btn btn--gold" target="_blank" rel="noopener noreferrer">
                  {t('onlineStore', locale)} ↗
                </a>
              ) : null}
            </div>
            <p className="enquire__note">{t('productEnquiryNote', locale)}</p>
          </div>

          {product.description ? (
            <div className="rich-text">
              <RichText data={product.description} />
            </div>
          ) : null}

          {Array.isArray(product.features) && product.features.length > 0 ? (
            <section className="spec">
              <h2>{t('technicalInfo', locale)}</h2>
              <dl>
                {product.features.map((feature) => (
                  <div key={feature.id ?? feature.label} className="spec__row">
                    <dt>{feature.label}</dt>
                    {feature.value ? <dd>{feature.value}</dd> : null}
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {product.reference ? (
            <p className="detail__reference">
              {t('reference', locale)}
              {locale === 'fr' ? ' : ' : ': '}
              {product.reference}
            </p>
          ) : null}
        </div>
      </article>
    </div>
  )
}
