import type { Media } from '@/payload-types'
import { asMedia, bestUrl, buildSrcSet, type MediaRef } from '@/lib/media'

type Props = {
  media: MediaRef
  size?: 'thumbnail' | 'card' | 'hero'
  sizes?: string
  className?: string
  /** Above the fold: load straight away instead of on scroll. */
  eager?: boolean
  /** Decorative images pass an empty string; otherwise the media's alt text. */
  alt?: string
}

/** A photograph from the media library, with every generated width offered. */
export function MediaImage({ media, size = 'card', sizes, className, eager = false, alt }: Props) {
  const image: Media | null = asMedia(media)
  if (!image) return null

  return (
    <img
      className={className}
      src={bestUrl(image, size)}
      srcSet={size === 'thumbnail' ? undefined : buildSrcSet(image)}
      sizes={sizes}
      alt={alt ?? image.alt ?? ''}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
    />
  )
}
