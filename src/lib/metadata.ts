import { getGlobal } from '@/lib/content'
import { otherLocale, type Locale } from '@/lib/locale'

const OPEN_GRAPH_LOCALES: Record<Locale, string> = { fr: 'fr_FR', en: 'en_GB' }

/**
 * What every page tells social networks about the site: its name and
 * language. A page that sets its own `openGraph` replaces the layout's, so it
 * starts from this one. Title, description and share card are filled in per
 * page.
 */
export const siteOpenGraph = async (locale: Locale) => {
  const settings = await getGlobal('site-settings', locale)

  return {
    type: 'website' as const,
    siteName: settings?.siteName || 'GROUPE JAOVAZAHA',
    locale: OPEN_GRAPH_LOCALES[locale],
    alternateLocale: OPEN_GRAPH_LOCALES[otherLocale(locale)],
  }
}
