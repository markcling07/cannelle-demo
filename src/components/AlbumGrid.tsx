'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type AlbumPhoto = {
  thumbUrl: string
  url: string
  alt: string
  caption?: string | null
}

type Labels = { open: string; close: string; previous: string; next: string }

/**
 * A grid of photographs; clicking one opens it large in a dialog, with the
 * arrow keys and buttons stepping through the album. Uses the browser's own
 * <dialog>, so focus is trapped and Escape closes it without extra code.
 */
export function AlbumGrid({ photos, labels }: { photos: AlbumPhoto[]; labels: Labels }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [index, setIndex] = useState(0)

  const open = (at: number) => {
    setIndex(at)
    dialog.current?.showModal()
  }

  const step = useCallback(
    (delta: number) => setIndex((current) => (current + delta + photos.length) % photos.length),
    [photos.length],
  )

  useEffect(() => {
    const element = dialog.current
    if (!element) return

    const onKey = (event: KeyboardEvent) => {
      if (!element.open) return
      if (event.key === 'ArrowLeft') step(-1)
      if (event.key === 'ArrowRight') step(1)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])

  const current = photos[index]

  return (
    <>
      <ul className="album__grid">
        {photos.map((photo, at) => (
          <li key={`${photo.url}-${at}`}>
            <button type="button" className="album__thumb" onClick={() => open(at)}>
              <img src={photo.thumbUrl} alt={photo.alt} loading="lazy" decoding="async" />
              <span className="visually-hidden">{labels.open}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className="lightbox"
        aria-label={current?.alt || labels.open}
        // A click on the dark backdrop (the dialog element itself) closes it.
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close()
        }}
      >
        {current ? (
          <figure className="lightbox__figure">
            <img src={current.url} alt={current.alt} />

            <button
              type="button"
              className="btn btn--light lightbox__close"
              onClick={() => dialog.current?.close()}
            >
              {labels.close}
            </button>

            {photos.length > 1 ? (
              <>
                <button
                  type="button"
                  className="gallery__nav gallery__nav--prev"
                  aria-label={labels.previous}
                  onClick={() => step(-1)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="gallery__nav gallery__nav--next"
                  aria-label={labels.next}
                  onClick={() => step(1)}
                >
                  ›
                </button>
              </>
            ) : null}

            <figcaption className="lightbox__caption">
              <span>{current.caption || current.alt}</span>
              <span aria-hidden="true">
                {index + 1} / {photos.length}
              </span>
            </figcaption>
          </figure>
        ) : null}
      </dialog>
    </>
  )
}
