import { getGlobal } from '@/lib/content'
import { t } from '@/lib/locale'
import { cardLocale, renderShareCard, SHARE_CARD_SIZE, SHARE_CARD_TYPE } from '@/lib/shareCard'

export const dynamic = 'force-dynamic'
export const size = SHARE_CARD_SIZE
export const contentType = SHARE_CARD_TYPE

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const locale = cardLocale((await params).locale)
  const about = await getGlobal('about-page', locale)

  return renderShareCard(locale, {
    title: about.title || t('aboutGroup', locale),
    text: about.intro,
    image: about.image,
  })
}
