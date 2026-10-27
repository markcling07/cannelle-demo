import { findBySlug } from '@/lib/content'
import { cardLocale, renderShareCard, SHARE_CARD_SIZE, SHARE_CARD_TYPE } from '@/lib/shareCard'

export const dynamic = 'force-dynamic'
export const size = SHARE_CARD_SIZE
export const contentType = SHARE_CARD_TYPE

type Props = { params: Promise<{ locale: string; slug: string }> }

/** A company's card: short name and country, full name, tagline and cover photo. */
export default async function Image({ params }: Props) {
  const { locale: raw, slug } = await params
  const locale = cardLocale(raw)

  const company = await findBySlug('companies', slug, locale, 1)
  if (!company) return renderShareCard(locale)

  return renderShareCard(locale, {
    eyebrow: [company.shortName, company.country].filter(Boolean).join(' · '),
    title: company.name,
    text: company.tagline || company.summary,
    image: company.coverImage,
  })
}
