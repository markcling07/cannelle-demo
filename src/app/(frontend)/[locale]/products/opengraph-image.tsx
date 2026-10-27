import { renderSectionCard, SHARE_CARD_SIZE, SHARE_CARD_TYPE } from '@/lib/shareCard'

export const dynamic = 'force-dynamic'
export const size = SHARE_CARD_SIZE
export const contentType = SHARE_CARD_TYPE

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return renderSectionCard(locale, 'products')
}
