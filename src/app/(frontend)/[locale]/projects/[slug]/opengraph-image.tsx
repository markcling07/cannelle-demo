import { findBySlug } from '@/lib/content'
import { PROJECT_STATUS_KEYS, t } from '@/lib/locale'
import { cardLocale, renderShareCard, SHARE_CARD_SIZE, SHARE_CARD_TYPE } from '@/lib/shareCard'

export const dynamic = 'force-dynamic'
export const size = SHARE_CARD_SIZE
export const contentType = SHARE_CARD_TYPE

type Props = { params: Promise<{ locale: string; slug: string }> }

/** A project's card: its progress and location, title, summary and cover photo. */
export default async function Image({ params }: Props) {
  const { locale: raw, slug } = await params
  const locale = cardLocale(raw)

  const project = await findBySlug('projects', slug, locale, 1)
  if (!project?.title) return renderShareCard(locale)

  const progress = project.progress ? t(PROJECT_STATUS_KEYS[project.progress], locale) : null

  return renderShareCard(locale, {
    eyebrow: [progress, project.location].filter(Boolean).join(' · '),
    title: project.title,
    text: project.summary,
    image: project.coverImage,
  })
}
