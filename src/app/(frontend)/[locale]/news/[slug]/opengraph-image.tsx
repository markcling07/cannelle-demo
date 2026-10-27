import { findBySlug } from '@/lib/content'
import { formatDate, t } from '@/lib/locale'
import { cardLocale, renderShareCard, SHARE_CARD_SIZE, SHARE_CARD_TYPE } from '@/lib/shareCard'

export const dynamic = 'force-dynamic'
export const size = SHARE_CARD_SIZE
export const contentType = SHARE_CARD_TYPE

type Props = { params: Promise<{ locale: string; slug: string }> }

/** A news item's card: "News" and the date, headline, summary and cover photo. */
export default async function Image({ params }: Props) {
  const { locale: raw, slug } = await params
  const locale = cardLocale(raw)

  const post = await findBySlug('posts', slug, locale, 1)
  if (!post?.title) return renderShareCard(locale)

  return renderShareCard(locale, {
    eyebrow: [t('news', locale), formatDate(post.publishedAt, locale)].filter(Boolean).join(' · '),
    title: post.title,
    text: post.excerpt,
    image: post.coverImage,
  })
}
