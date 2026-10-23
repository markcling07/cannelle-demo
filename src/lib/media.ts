import type { Media } from '@/payload-types'

export type MediaRef = number | Media | null | undefined

/** Upload fields come back as an id until they are populated. */
export const asMedia = (value: MediaRef): Media | null =>
  value && typeof value === 'object' ? value : null

type SizeName = 'thumbnail' | 'card' | 'hero'

const sizeUrl = (media: Media, name: SizeName): string | null => {
  const size = media.sizes?.[name]
  return size?.url ?? null
}

/**
 * Payload generates several widths on upload. We hand all of them to the
 * browser so a phone downloads the small file and a desktop the large one —
 * this is what makes the site quick on mobile.
 */
export const buildSrcSet = (media: Media): string | undefined => {
  const entries: string[] = []

  const thumbnail = media.sizes?.thumbnail
  const card = media.sizes?.card
  const hero = media.sizes?.hero

  if (thumbnail?.url && thumbnail.width) entries.push(`${thumbnail.url} ${thumbnail.width}w`)
  if (card?.url && card.width) entries.push(`${card.url} ${card.width}w`)
  if (hero?.url && hero.width) entries.push(`${hero.url} ${hero.width}w`)

  return entries.length > 0 ? entries.join(', ') : undefined
}

/** Best single URL to use as the `src` fallback. */
export const bestUrl = (media: Media, preferred: SizeName = 'card'): string =>
  sizeUrl(media, preferred) ?? media.url ?? ''
