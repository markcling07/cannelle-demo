import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getPayload, type DataFromGlobalSlug, type GlobalSlug } from 'payload'
import config from '@payload-config'

import { otherLocale, type Locale } from '@/lib/locale'

/** Collections with their own public page at /<locale>/<section>/<slug>. */
export type SlugCollection = 'products' | 'posts' | 'companies' | 'projects'

export const getPayloadClient = () => getPayload({ config })

/**
 * A global (site settings, home page…) in one language. Cached for the
 * request, so the layout and the page share a single database read.
 */
export const getGlobal = cache(
  async <S extends GlobalSlug>(slug: S, locale: Locale, depth = 1): Promise<DataFromGlobalSlug<S>> => {
    const payload = await getPayloadClient()
    return payload.findGlobal({ slug, locale, depth }) as Promise<DataFromGlobalSlug<S>>
  },
)

/**
 * The published document at this address, in this language. The Local API
 * skips access rules, hence the explicit "published" condition.
 */
export const findBySlug = async <C extends SlugCollection>(
  collection: C,
  slug: string,
  locale: Locale,
  depth = 2,
) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection,
    locale,
    depth,
    limit: 1,
    draft: false,
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
  })

  return result.docs[0] ?? null
}

/**
 * French and English addresses differ, so a visitor who switches language
 * lands on an address that does not exist in the new language. Look it up by
 * its other-language address and redirect to the translated one.
 *
 * Returns true when the document exists but has no version in this language
 * yet (the page then says so), false when it does not exist at all.
 */
export const redirectToTranslation = async (
  collection: SlugCollection,
  slug: string,
  locale: Locale,
  basePath: string,
): Promise<boolean> => {
  const counterpart = await findBySlug(collection, slug, otherLocale(locale), 0)
  if (!counterpart) return false

  const payload = await getPayloadClient()
  const translated = await payload
    .findByID({ collection, id: counterpart.id, locale, depth: 0, draft: false })
    .catch(() => null)

  const translatedSlug = translated && 'slug' in translated ? translated.slug : null
  const translatedTitle =
    translated && ('title' in translated ? translated.title : 'name' in translated ? translated.name : null)

  if (translatedSlug && translatedTitle && translatedSlug !== slug) {
    redirect(`/${locale}/${basePath}/${translatedSlug}`)
  }

  return true
}

/**
 * The Group's companies in display order, with logos. Used by the menu, the
 * footer, the home page and the contact page — one read per request.
 */
export const getCompanies = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'companies',
    locale,
    depth: 1,
    limit: 20,
    sort: 'order',
    draft: false,
    where: { and: [{ _status: { equals: 'published' } }, { slug: { exists: true } }] },
  })

  return result.docs
})

/** Published and translated into this language — the filter every list uses. */
export const publishedIn = (titleField = 'title') => [
  { _status: { equals: 'published' } },
  { [titleField]: { exists: true } },
]
