import { findBySlug } from '@/lib/content'
import { cardLocale, renderShareCard, SHARE_CARD_SIZE, SHARE_CARD_TYPE } from '@/lib/shareCard'

export const dynamic = 'force-dynamic'
export const size = SHARE_CARD_SIZE
export const contentType = SHARE_CARD_TYPE

type Props = { params: Promise<{ locale: string; slug: string }> }

/** A product's card: category and company, name, summary and main photo. */
export default async function Image({ params }: Props) {
  const { locale: raw, slug } = await params
  const locale = cardLocale(raw)

  const product = await findBySlug('products', slug, locale, 1)
  if (!product?.title) return renderShareCard(locale)

  const category = typeof product.category === 'object' ? product.category?.title : null
  const company = typeof product.company === 'object' ? product.company?.shortName : null

  return renderShareCard(locale, {
    eyebrow: [category, company].filter(Boolean).join(' · '),
    title: product.title,
    text: product.shortDescription,
    image: product.image,
  })
}
