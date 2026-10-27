import { getGlobal } from '@/lib/content'
import { t } from '@/lib/locale'
import { cardLocale, renderShareCard, SHARE_CARD_SIZE, SHARE_CARD_TYPE } from '@/lib/shareCard'

export const dynamic = 'force-dynamic'
export const size = SHARE_CARD_SIZE
export const contentType = SHARE_CARD_TYPE

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const locale = cardLocale((await params).locale)
  const legal = await getGlobal('legal-pages', locale, 0)

  return renderShareCard(locale, { title: legal.privacy?.title || t('privacy', locale) })
}
