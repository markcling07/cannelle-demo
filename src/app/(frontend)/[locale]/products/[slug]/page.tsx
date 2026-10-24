import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { Product } from '@/payload-types'
import { AddToCart } from '@/components/AddToCart'
import { ProductGallery, type GalleryImage } from '@/components/ProductGallery'
import { ReviewForm } from '@/components/ReviewForm'
import { Stars } from '@/components/Stars'
import { MAX_QUANTITY } from '@/lib/cart'
import { asMedia, buildSrcSet, bestUrl } from '@/lib/media'
import { approvedReviews, reviewStats } from '@/lib/reviews'
import {
  formatDate,
  formatPrice,
  formatRating,
  isLocale,
  otherLocale,
  ratingLabel,
  reviewCount,
  stockStatus,
  t,
  type Locale,
} from '@/lib/locale'

export const dynamic = 'force-dynamic'

type PageParams = { params: Promise<{ locale: string; slug: string }> }

/** Published product matching this address, in this language. */
const findBySlug = async (slug: string, locale: Locale): Promise<Product | null> => {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'products',
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

  const product = await findBySlug(slug, raw)
  if (!product?.title) return {}

  const image = asMedia(product.image)

  return {
    title: product.title,
    description: product.shortDescription ?? undefined,
    alternates: { canonical: `/${raw}/products/${product.slug}` },
    openGraph: {
      title: product.title,
      description: product.shortDescription ?? undefined,
      images: image ? [{ url: bestUrl(image, 'hero') }] : undefined,
    },
  }
}

export default async function ProductPage({ params }: PageParams) {
  const { locale: rawLocale, slug } = await params
  if (!isLocale(rawLocale)) notFound()
  const locale: Locale = rawLocale

  const product = await findBySlug(slug, locale)

  // The French and English addresses of a product differ, so a visitor who
  // switches language lands on an address that does not exist in the new
  // language. Look it up by its other-language address and redirect.
  if (!product) {
    const counterpart = await findBySlug(slug, otherLocale(locale))

    if (counterpart) {
      const payload = await getPayload({ config })

      const translated = await payload
        .findByID({
          collection: 'products',
          id: counterpart.id,
          locale,
          depth: 0,
          draft: false,
        })
        .catch(() => null)

      if (translated?.slug && translated.slug !== slug) {
        redirect(`/${locale}/products/${translated.slug}`)
      }

      return (
        <div className="container">
          <Link href={`/${locale}`} className="back-link">
            {t('backToCatalogue', locale)}
          </Link>
          <p className="empty">{t('notTranslated', locale)}</p>
        </div>
      )
    }

    notFound()
  }

  const image = asMedia(product.image)
  const price = formatPrice(product.price, product.currency, locale)
  const extras = Array.isArray(product.gallery)
    ? product.gallery.map(asMedia).filter((m): m is NonNullable<typeof m> => Boolean(m))
    : []

  // The main photograph first, then the gallery — one set to step through.
  const images: GalleryImage[] = [image, ...extras]
    .filter((media): media is NonNullable<typeof media> => Boolean(media))
    .map((media) => ({
      url: bestUrl(media, 'hero'),
      srcSet: buildSrcSet(media),
      thumbUrl: bestUrl(media, 'thumbnail'),
      alt: media.alt ?? '',
    }))

  const stock = stockStatus(product.stock, product.inStock, locale)
  const [stats, reviews] = await Promise.all([
    reviewStats([product.id]).then((map) => map.get(product.id)),
    approvedReviews(product.id),
  ])

  return (
    <div className="container">
      <Link href={`/${locale}`} className="back-link">
        {t('backToCatalogue', locale)}
      </Link>

      <article className="detail">
        <div className="detail__media">
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
          <h1 className="detail__title">{product.title}</h1>

          {stats ? (
            <a href="#reviews" className="detail__rating">
              <Stars value={stats.average} label={ratingLabel(stats.average, locale)} />
              <span>{formatRating(stats.average, locale)}</span>
              <span className="detail__rating-count">({reviewCount(stats.count, locale)})</span>
            </a>
          ) : null}

          {product.shortDescription ? (
            <p className="detail__lead">{product.shortDescription}</p>
          ) : null}

          {price ? <p className="detail__price">{price}</p> : null}

          <p className="detail__stock" data-tone={stock.tone}>
            <span className="detail__stock-dot" aria-hidden="true" />
            {stock.text}
          </p>

          {typeof product.price === 'number' && stock.tone !== 'out' ? (
            <AddToCart
              productId={product.id}
              price={product.price}
              currency={product.currency}
              maxQty={Math.min(MAX_QUANTITY, product.stock ?? MAX_QUANTITY)}
              locale={locale}
            />
          ) : null}

          {stock.tone === 'out' ? <p className="buy buy--soldout">{t('soldOutNote', locale)}</p> : null}

          {product.description ? (
            <div className="rich-text">
              <RichText data={product.description} />
            </div>
          ) : null}

          {Array.isArray(product.features) && product.features.length > 0 ? (
            <section className="spec">
              <h2>{t('features', locale)}</h2>
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
              {t('reference', locale)}: {product.reference}
            </p>
          ) : null}
        </div>
      </article>

      {/* --- reviews --------------------------------------------------------- */}
      <section id="reviews" className="reviews" aria-labelledby="reviews-heading">
        <div className="reviews__summary">
          <h2 id="reviews-heading" className="reviews__heading">
            {t('reviews', locale)}
          </h2>

          {stats ? (
            <>
              <p className="reviews__average">
                {formatRating(stats.average, locale)}
                <span> / 5</span>
              </p>
              <Stars value={stats.average} label={ratingLabel(stats.average, locale)} size="lg" />
              <p className="reviews__count">{reviewCount(stats.count, locale)}</p>

              <ul className="reviews__bars">
                {[5, 4, 3, 2, 1].map((star) => {
                  const n = stats.distribution[star - 1]
                  return (
                    <li key={star} className="reviews__bar">
                      <span>{star} ★</span>
                      <span className="reviews__track" aria-hidden="true">
                        <span style={{ width: `${(n / stats.count) * 100}%` }} />
                      </span>
                      <span className="reviews__bar-count">{n}</span>
                    </li>
                  )
                })}
              </ul>
            </>
          ) : (
            <p className="reviews__empty">{t('noReviews', locale)}</p>
          )}
        </div>

        <div className="reviews__main">
          {reviews.length > 0 ? (
            <ul className="reviews__list">
              {reviews.map((review) => (
                <li key={review.id} className="review">
                  <div className="review__head">
                    <Stars value={review.rating} label={ratingLabel(review.rating, locale)} size="sm" />
                    <span className="review__name">{review.name}</span>
                    <span className="review__date">{formatDate(review.createdAt, locale)}</span>
                  </div>
                  <p className="review__comment" lang={review.language ?? undefined}>
                    {review.comment}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}

          <ReviewForm productId={product.id} locale={locale} />
        </div>
      </section>
    </div>
  )
}
