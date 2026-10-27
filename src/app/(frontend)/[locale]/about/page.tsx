import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { MediaImage } from '@/components/MediaImage'
import { PageHeader } from '@/components/PageHeader'
import { getGlobal } from '@/lib/content'
import { isLocale, t, type Locale } from '@/lib/locale'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  const about = await getGlobal('about-page', locale, 0)

  return {
    title: about.title || t('aboutGroup', locale),
    description: about.intro ?? undefined,
    alternates: { canonical: `/${locale}/about` },
  }
}

export default async function AboutPage({ params }: PageProps) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const about = await getGlobal('about-page', locale)
  const values = about.values ?? []

  return (
    <>
      <PageHeader eyebrow={t('aboutGroup', locale)} title={about.title} intro={about.intro} />

      <div className="container split page-body">
        {about.content ? (
          <div className="rich-text">
            <RichText data={about.content} />
          </div>
        ) : null}

        <div className="split__media">
          <MediaImage media={about.image} sizes="(max-width: 900px) 100vw, 50vw" eager />
        </div>
      </div>

      {values.length > 0 ? (
        <section className="section section--cream" aria-labelledby="values-title">
          <div className="container">
            <div className="section__head">
              <h2 id="values-title" className="section__title">
                {t('ourValues', locale)}
              </h2>
              <Link href={`/${locale}/leadership`} className="section__link">
                {t('leadership', locale)}
              </Link>
            </div>

            <ol className="values">
              {values.map((value, index) => (
                <li key={value.id ?? value.title} className="value">
                  <span className="value__number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="value__title">{value.title}</h3>
                  {value.text ? <p>{value.text}</p> : null}
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}
    </>
  )
}
