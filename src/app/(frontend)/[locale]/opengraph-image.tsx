import { getGlobal } from '@/lib/content'
import { cardLocale, renderShareCard, SHARE_CARD_SIZE, SHARE_CARD_TYPE } from '@/lib/shareCard'

export const dynamic = 'force-dynamic'
export const size = SHARE_CARD_SIZE
export const contentType = SHARE_CARD_TYPE

/** The home page's card: the banner's title, text and photo. */
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const locale = cardLocale((await params).locale)
  const { hero } = await getGlobal('home-page', locale)

  return renderShareCard(locale, {
    eyebrow: hero?.eyebrow,
    title: hero?.title,
    text: hero?.text,
    image: hero?.image,
  })
}
