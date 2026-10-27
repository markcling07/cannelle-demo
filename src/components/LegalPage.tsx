import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { getGlobal } from '@/lib/content'
import { isLocale, t, type Locale } from '@/lib/locale'

export type LegalKey = 'legalNotice' | 'privacy'

/** Shared by /legal-notice and /privacy: one tab of the "legal-pages" global. */
export async function LegalPage({ locale: raw, page }: { locale: string; page: LegalKey }) {
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const legal = await getGlobal('legal-pages', locale, 0)
  const content = legal[page]

  return (
    <div className="container">
      <article className="article page-header">
        <h1 className="article__title">{content?.title || t(page, locale)}</h1>
        {content?.content ? (
          <div className="rich-text">
            <RichText data={content.content} />
          </div>
        ) : null}
      </article>
    </div>
  )
}

export async function legalMetadata(raw: string, page: LegalKey) {
  if (!isLocale(raw)) return {}
  const legal = await getGlobal('legal-pages', raw, 0)
  return { title: legal[page]?.title || t(page, raw) }
}
