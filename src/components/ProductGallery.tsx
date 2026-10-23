'use client'

import { useCallback, useState } from 'react'

export type GalleryImage = {
  url: string
  srcSet?: string
  thumbUrl: string
  alt: string
}

type Labels = {
  previous: string
  next: string
  group: string
}

/**
 * The main photograph plus the gallery, as one set the visitor can step
 * through. Arrows wrap around, the thumbnails jump straight to an image, and
 * the left/right keys work once anything here has focus.
 *
 * With a single photograph the arrows, counter and thumbnails are all hidden,
 * so a product with one image looks exactly as it did before.
 */
export function ProductGallery({ images, labels }: { images: GalleryImage[]; labels: Labels }) {
  const [index, setIndex] = useState(0)

  const count = images.length
  const many = count > 1

  const step = useCallback(
    (delta: number) => setIndex((current) => (current + delta + count) % count),
    [count],
  )

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!many) return
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      step(1)
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      step(-1)
    }
  }

  const current = images[index]
  if (!current) return null

  return (
    <div
      className="gallery"
      role="group"
      aria-roledescription="carousel"
      aria-label={labels.group}
      onKeyDown={onKeyDown}
    >
      <div className="gallery__frame">
        <img
          key={current.url}
          src={current.url}
          srcSet={current.srcSet}
          sizes="(max-width: 900px) 100vw, 50vw"
          alt={current.alt}
        />

        {many ? (
          <>
            <button
              type="button"
              className="gallery__nav gallery__nav--prev"
              onClick={() => step(-1)}
              aria-label={labels.previous}
            >
              <Chevron direction="left" />
            </button>

            <button
              type="button"
              className="gallery__nav gallery__nav--next"
              onClick={() => step(1)}
              aria-label={labels.next}
            >
              <Chevron direction="right" />
            </button>

            <p className="gallery__counter" aria-live="polite">
              {index + 1} / {count}
            </p>
          </>
        ) : null}
      </div>

      {many ? (
        <ul className="gallery__thumbs">
          {images.map((image, position) => (
            <li key={image.url}>
              <button
                type="button"
                className={position === index ? 'gallery__thumb is-current' : 'gallery__thumb'}
                onClick={() => setIndex(position)}
                aria-label={`${labels.group} ${position + 1}`}
                aria-current={position === index ? 'true' : undefined}
              >
                <img src={image.thumbUrl} alt="" loading="lazy" decoding="async" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        d={direction === 'left' ? 'M15 5 L8 12 L15 19' : 'M9 5 L16 12 L9 19'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
