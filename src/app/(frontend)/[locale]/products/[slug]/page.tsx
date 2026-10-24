import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { Product } from '@/payload-types'
import { AddToCart } from '@/components/AddToCart'
import { ProductGallery, type GalleryImage } from '@/components/ProductGallery'
import { asMedia, buildSrcSet, bestUrl } from '@/lib/media'
import { formatPrice, isLocale, otherLocale, t, type Locale } from '@/lib/locale'

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

          {product.shortDescription ? (
            <p className="detail__lead">{product.shortDescription}</p>
          ) : null}

          {price ? <p className="detail__price">{price}</p> : null}

          <p className={product.inStock ? 'detail__stock is-in' : 'detail__stock'}>
            {product.inStock ? t('inStock', locale) : t('outOfStock', locale)}
          </p>

          {typeof product.price === 'number' ? (
            <AddToCart productId={product.id} locale={locale} />
          ) : null}

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
    </div>
  )
}
