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
  explore: { fr: 'Explorer', en: 'Explore' },
  latestArticle: { fr: 'Dernier article', en: 'Latest article' },
  featured: { fr: 'À la une', en: 'Featured' },
  allArticles: { fr: 'Tous les articles', en: 'All articles' },
  viewCatalogue: { fr: 'Voir le catalogue', en: 'See the catalog' },
  subscribe: { fr: 'S’inscrire', en: 'Subscribe' },
  journalNewsletterPrompt: {
    fr: 'Recevez les prochains articles directement par e-mail.',
    en: 'Get the next articles straight to your inbox.',
  },
  // Defaults for the journal introduction, used until Site settings has its own.
  journalStatement: {
    fr: 'Des carnets de terrain, de la plantation à la cuisine :',
    en: 'Field notes, from the plantation to the kitchen:',
  },
  journalAccent: {
    fr: 'ce que nos épices racontent.',
    en: 'the stories behind our spices.',
  },
  journalIntro: {
    fr: 'Récoltes, préparation, recettes et conseils : notre équipe partage ce qu’elle sait des épices de Madagascar, de la vanille de la SAVA au cacao du Sambirano.',
    en: 'Harvests, curing, recipes and advice: our team shares what it knows about Madagascar’s spices, from SAVA vanilla to Sambirano cacao.',
  },
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
  // --- basket and mock checkout --------------------------------------------
  cart: { fr: 'Panier', en: 'Cart' },
  quantity: { fr: 'Quantité', en: 'Quantity' },
  decrease: { fr: 'Diminuer la quantité', en: 'Decrease quantity' },
  increase: { fr: 'Augmenter la quantité', en: 'Increase quantity' },
  addToCart: { fr: 'Ajouter au panier', en: 'Add to cart' },
  buyNow: { fr: 'Acheter maintenant', en: 'Buy now' },
  addedToCart: { fr: 'Ajouté au panier.', en: 'Added to your cart.' },
  viewCart: { fr: 'Voir le panier', en: 'View cart' },
  cartError: {
    fr: 'Ce produit ne peut pas être commandé pour le moment.',
    en: 'This product cannot be ordered right now.',
  },
  cartEmpty: { fr: 'Votre panier est vide.', en: 'Your cart is empty.' },
  continueShopping: { fr: '← Continuer mes achats', en: '← Continue shopping' },
  remove: { fr: 'Retirer', en: 'Remove' },
  each: { fr: 'l’unité', en: 'each' },
  orderSummary: { fr: 'Récapitulatif', en: 'Order summary' },
  subtotal: { fr: 'Sous-total', en: 'Subtotal' },
  shipping: { fr: 'Livraison', en: 'Shipping' },
  shippingFree: { fr: 'Offerte', en: 'Free' },
  freeShippingHint: {
    fr: 'Plus que {amount} pour la livraison offerte.',
    en: '{amount} more for free shipping.',
  },
  total: { fr: 'Total', en: 'Total' },
  proceedToCheckout: { fr: 'Passer au paiement', en: 'Proceed to checkout' },
  checkout: { fr: 'Paiement', en: 'Checkout' },
  backToCart: { fr: '← Retour au panier', en: '← Back to cart' },
  testMode: { fr: 'Mode test', en: 'Test mode' },
  testModeText: {
    fr: 'Aucun paiement réel n’est effectué. Carte acceptée : 4242 4242 4242 4242 — carte refusée : 4000 0000 0000 0002, avec toute date future et tout CVC.',
    en: 'No real payment is taken. Approved card: 4242 4242 4242 4242 — declined card: 4000 0000 0000 0002, with any future date and any CVC.',
  },
  contact: { fr: 'Contact', en: 'Contact' },
  emailAddress: { fr: 'Adresse e-mail', en: 'Email address' },
  phone: { fr: 'Téléphone', en: 'Phone' },
  deliveryAddress: { fr: 'Adresse de livraison', en: 'Delivery address' },
  fullName: { fr: 'Nom complet', en: 'Full name' },
  address: { fr: 'Adresse', en: 'Address' },
  postalCode: { fr: 'Code postal', en: 'Postcode' },
  city: { fr: 'Ville', en: 'City' },
  country: { fr: 'Pays', en: 'Country' },
  paymentMethod: { fr: 'Moyen de paiement', en: 'Payment method' },
  methodCard: { fr: 'Carte bancaire', en: 'Card' },
  methodMobile: { fr: 'Mobile Money', en: 'Mobile Money' },
  methodPaypal: { fr: 'PayPal', en: 'PayPal' },
  cardNumber: { fr: 'Numéro de carte', en: 'Card number' },
  cardExpiry: { fr: 'Expiration (MM / AA)', en: 'Expiry (MM / YY)' },
  cardCvc: { fr: 'CVC', en: 'CVC' },
  cardName: { fr: 'Nom sur la carte', en: 'Name on card' },
  operator: { fr: 'Opérateur', en: 'Operator' },
  mobileNumber: { fr: 'Numéro Mobile Money', en: 'Mobile Money number' },
  mobileHint: {
    fr: 'Vous recevrez une demande de confirmation sur ce numéro.',
    en: 'You will receive a confirmation request on this number.',
  },
  paypalHint: {
    fr: 'Vous serez redirigé vers PayPal pour vous connecter et confirmer le paiement.',
    en: 'You will be redirected to PayPal to sign in and confirm the payment.',
  },
  securePayment: {
    fr: 'Paiement sécurisé par notre prestataire. Vos coordonnées bancaires ne sont jamais conservées sur ce site.',
    en: 'Payment secured by our payment provider. Your card details are never stored on this site.',
  },
  payAmount: { fr: 'Payer {amount}', en: 'Pay {amount}' },
  processing: { fr: 'Paiement en cours…', en: 'Processing payment…' },
  processingHint: {
    fr: 'Ne fermez pas cette page.',
    en: 'Please do not close this page.',
  },
  awaitingMobile: {
    fr: 'Demande envoyée au {phone}. Validez le paiement avec votre code secret sur votre téléphone.',
    en: 'Request sent to {phone}. Confirm the payment with your PIN on your phone.',
  },
  redirectPaypal: { fr: 'Redirection vers PayPal…', en: 'Redirecting to PayPal…' },
  declined: {
    fr: 'Paiement refusé par votre banque. Vérifiez vos informations ou utilisez une autre carte.',
    en: 'Your bank declined the payment. Check your details or use another card.',
  },
  errRequired: { fr: 'Champ obligatoire.', en: 'This field is required.' },
  errEmail: { fr: 'Adresse e-mail invalide.', en: 'Invalid email address.' },
  errPhone: { fr: 'Numéro de téléphone invalide.', en: 'Invalid phone number.' },
  errCardNumber: { fr: 'Numéro de carte invalide.', en: 'Invalid card number.' },
  errExpiry: { fr: 'Date d’expiration invalide.', en: 'Invalid expiry date.' },
  errCvc: { fr: 'CVC invalide.', en: 'Invalid CVC.' },
  errFixForm: {
    fr: 'Vérifiez les champs signalés.',
    en: 'Please check the highlighted fields.',
  },
  orderConfirmed: {
    fr: 'Merci, votre commande est confirmée',
    en: 'Thank you, your order is confirmed',
  },
  orderNumber: { fr: 'Commande n°', en: 'Order no.' },
  orderDate: { fr: 'Date', en: 'Date' },
  paidWith: { fr: 'Payé par', en: 'Paid with' },
  deliverTo: { fr: 'Livraison à', en: 'Delivering to' },
  demoNoCharge: {
    fr: 'Démonstration : aucun montant n’a été débité et aucun e-mail n’a été envoyé.',
    en: 'Demonstration: nothing has been charged and no email has been sent.',
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

/** "Panier, 2 articles" / "Cart, 2 items" — the cart icon's accessible name. */
export const cartLabel = (count: number, locale: Locale): string =>
  locale === 'fr'
    ? `Panier, ${count} article${count > 1 ? 's' : ''}`
    : `Cart, ${count} item${count === 1 ? '' : 's'}`

/** Fills a "{name}" placeholder in one of the strings above. */
export const fill = (text: string, values: Record<string, string>): string =>
  text.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match)

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
