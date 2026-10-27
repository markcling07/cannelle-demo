import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AlbumGrid, type AlbumPhoto } from '@/components/AlbumGrid'
import { PageHeader } from '@/components/PageHeader'
import { getGlobal, getPayloadClient } from '@/lib/content'
import { asMedia, bestUrl } from '@/lib/media'
import { fill, isLocale, t, type Locale } from '@/lib/locale'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  const intros = await getGlobal('section-intros', locale, 0)

  return {
    title: intros.gallery?.title || t('gallery', locale),
    description: intros.gallery?.intro ?? undefined,
    alternates: { canonical: `/${locale}/gallery` },
  }
}

export default async function GalleryPage({ params }: PageProps) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const payload = await getPayloadClient()

  const [intros, albums] = await Promise.all([
    getGlobal('section-intros', locale, 0),
    payload.find({
      collection: 'albums',
      locale,
      depth: 1,
      limit: 50,
      sort: 'order',
      where: { title: { exists: true } },
    }),
  ])

  const labels = {
    open: t('openPhoto', locale),
    close: t('close', locale),
    previous: t('previousImage', locale),
    next: t('nextImage', locale),
  }

  return (
    <>
      <PageHeader title={intros.gallery?.title || t('gallery', locale)} intro={intros.gallery?.intro} />

      <div className="container">
        {albums.docs.length === 0 ? <p className="empty">{t('noAlbums', locale)}</p> : null}

        {albums.docs.map((album) => {
          const photos: AlbumPhoto[] = (album.photos ?? [])
            .map(asMedia)
            .filter((media): media is NonNullable<typeof media> => Boolean(media))
            .map((media) => ({
              thumbUrl: bestUrl(media, 'thumbnail'),
              url: bestUrl(media, 'hero'),
              alt: media.alt ?? '',
              caption: media.caption,
            }))

          const date = album.date
            ? new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
                month: 'long',
                year: 'numeric',
              }).format(new Date(album.date))
            : null

          return (
            <section key={album.id} className="album" aria-labelledby={`album-${album.id}`}>
              <div className="album__head">
                <h2 id={`album-${album.id}`} className="album__title">
                  {album.title}
                </h2>
                <p className="album__meta">
                  {[date, fill(t('photoCount', locale), { count: String(photos.length) })]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {album.description ? <p className="album__text">{album.description}</p> : null}
              </div>

              <AlbumGrid photos={photos} labels={labels} />
            </section>
          )
        })}
      </div>
    </>
  )
}
