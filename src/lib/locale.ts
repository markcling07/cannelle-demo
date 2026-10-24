export const LOCALES = ['fr', 'en'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'fr'

export const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value)

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: 'FR',
  en: 'EN',
}

/**
 * The handful of words that belong to the interface rather than to the
 * content. Everything else on the page comes from the administration area.
 */
const STRINGS = {
  catalogue: { fr: 'Catalogue', en: 'Catalog' },
  journal: { fr: 'Journal', en: 'Journal' },
  allProducts: { fr: 'Tout', en: 'All' },
  sortBy: { fr: 'Trier par', en: 'Sort by' },
  sortDefault: { fr: 'Par défaut', en: 'Default' },
  sortPriceAsc: { fr: 'Prix croissant', en: 'Price: low to high' },
  sortPriceDesc: { fr: 'Prix décroissant', en: 'Price: high to low' },
  seeMore: { fr: 'Voir plus', en: 'See more' },
  viewProduct: { fr: 'Voir le produit', en: 'View product' },
  backToCatalogue: { fr: '← Retour au catalogue', en: '← Back to catalog' },
  backToJournal: { fr: '← Retour au journal', en: '← Back to the journal' },
  reference: { fr: 'Référence', en: 'Reference' },
  previousImage: { fr: 'Photographie précédente', en: 'Previous photograph' },
  nextImage: { fr: 'Photographie suivante', en: 'Next photograph' },
  productPhotos: { fr: 'Photographies du produit', en: 'Product photographs' },
  features: { fr: 'Caractéristiques', en: 'Key features' },
  inStock: { fr: 'En stock', en: 'In stock' },
  outOfStock: { fr: 'Sur commande', en: 'On order' },
  noProducts: {
    fr: 'Aucun produit publié pour le moment.',
    en: 'No products published yet.',
  },
  noPosts: {
    fr: 'Aucun article publié pour le moment.',
    en: 'No articles published yet.',
  },
  notTranslated: {
    fr: "Ce contenu n'a pas encore de version française.",
    en: 'This content does not have an English version yet.',
  },
  readArticle: { fr: "Lire l'article", en: 'Read article' },
  newsletterHeading: {
    fr: 'Inscrivez-vous à la lettre d’information\net restez informé',
    en: 'Subscribe to the newsletter\nand stay up to date',
  },
  emailPlaceholder: { fr: 'Adresse e-mail', en: 'Email' },
  send: { fr: 'Envoyer', en: 'Send' },
  subscribeOk: {
    fr: 'Merci, votre inscription est enregistrée.',
    en: 'Thank you, you are subscribed.',
  },
  subscribeExists: {
    fr: 'Cette adresse est déjà inscrite.',
    en: 'That address is already subscribed.',
  },
  subscribeInvalid: {
    fr: 'Veuillez saisir une adresse e-mail valide.',
    en: 'Please enter a valid email address.',
  },
  subscribeError: {
    fr: 'Une erreur est survenue. Réessayez.',
    en: 'Something went wrong. Please try again.',
  },
  skipToContent: { fr: 'Aller au contenu', en: 'Skip to content' },
  demoNotice: {
    fr: 'Démonstration — contenu fictif',
    en: 'Demonstration — sample content',
  },
} satisfies Record<string, Record<Locale, string>>

export type StringKey = keyof typeof STRINGS

export const t = (key: StringKey, locale: Locale): string => STRINGS[key][locale]

/** "Affichage de 6 sur 12 résultats" / "Showing 6 of 12 results" */
export const showingResults = (shown: number, total: number, locale: Locale): string =>
  locale === 'fr'
    ? `Affichage de ${shown} sur ${total} résultats`
    : `Showing ${shown} of ${total} results`

/** The other language, for the switcher in the header. */
export const otherLocale = (locale: Locale): Locale => (locale === 'fr' ? 'en' : 'fr')

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  MGA: 'Ar',
}

export const formatPrice = (
  price: number | null | undefined,
  currency: string | null | undefined,
  locale: Locale,
): string | null => {
  if (typeof price !== 'number') return null

  const code = currency ?? 'EUR'

  try {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: code === 'MGA' ? 0 : 2,
    }).format(price)
  } catch {
    // Unknown currency code — fall back to a plain number plus a symbol.
    return `${price} ${CURRENCY_SYMBOLS[code] ?? code}`
  }
}

export const formatDate = (value: string | null | undefined, locale: Locale): string | null => {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
