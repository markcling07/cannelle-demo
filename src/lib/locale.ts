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
  // --- navigation -----------------------------------------------------------
  home: { fr: 'Accueil', en: 'Home' },
  about: { fr: 'À propos', en: 'About' },
  aboutGroup: { fr: 'À propos du Groupe', en: 'About the Group' },
  leadership: { fr: 'Fondateur et direction', en: 'Founder and management' },
  companies: { fr: 'Nos sociétés', en: 'Our companies' },
  companiesOverview: { fr: 'Vue d’ensemble', en: 'Overview' },
  products: { fr: 'Nos produits', en: 'Our products' },
  projects: { fr: 'Nos projets', en: 'Our projects' },
  partnerships: { fr: 'Partenariats', en: 'Partnerships' },
  news: { fr: 'Actualités', en: 'News' },
  gallery: { fr: 'Galerie', en: 'Gallery' },
  contact: { fr: 'Contact', en: 'Contact' },
  legalNotice: { fr: 'Mentions légales', en: 'Legal notice' },
  privacy: { fr: 'Politique de confidentialité', en: 'Privacy policy' },
  menu: { fr: 'Menu', en: 'Menu' },
  mainMenu: { fr: 'Menu principal', en: 'Main menu' },
  footerMenu: { fr: 'Plan du site', en: 'Site map' },
  footerGroup: { fr: 'Le Groupe', en: 'The Group' },
  footerActivities: { fr: 'Activités', en: 'What we do' },
  allRightsReserved: { fr: 'Tous droits réservés.', en: 'All rights reserved.' },
  language: { fr: 'Langue', en: 'Language' },

  // --- shared ---------------------------------------------------------------
  learnMore: { fr: 'En savoir plus', en: 'Learn more' },
  seeAll: { fr: 'Tout voir', en: 'See all' },
  seeMore: { fr: 'Voir plus', en: 'See more' },
  explore: { fr: 'Explorer', en: 'Explore' },
  notTranslated: {
    fr: "Ce contenu n'a pas encore de version française.",
    en: 'This content does not have an English version yet.',
  },
  previousImage: { fr: 'Photographie précédente', en: 'Previous photograph' },
  nextImage: { fr: 'Photographie suivante', en: 'Next photograph' },
  close: { fr: 'Fermer', en: 'Close' },
  visitWebsite: { fr: 'Site web', en: 'Website' },

  // --- home -----------------------------------------------------------------
  ourStructure: { fr: 'Notre organisation', en: 'How we are organised' },
  umbrellaBrand: { fr: 'Marque commune', en: 'Umbrella brand' },
  independentCompany: { fr: 'Société indépendante', en: 'Independent company' },
  futureProjects: { fr: 'Projets futurs', en: 'Future projects' },
  futureProjectsText: {
    fr: 'De nouvelles activités pourront rejoindre le Groupe.',
    en: 'New activities may join the Group in future.',
  },
  featuredProducts: { fr: 'Produits à découvrir', en: 'Featured products' },
  latestNews: { fr: 'Dernières actualités', en: 'Latest news' },
  ourPartners: { fr: 'Nos partenaires', en: 'Our partners' },
  discover: { fr: 'Découvrir {name}', en: 'Discover {name}' },

  // --- about and leadership ------------------------------------------------
  ourValues: { fr: 'Nos valeurs', en: 'Our values' },
  founder: { fr: 'Fondateur', en: 'Founder' },
  management: { fr: 'Direction', en: 'Management' },
  groupLevel: { fr: 'Groupe', en: 'Group' },

  // --- companies -----------------------------------------------------------
  keyFacts: { fr: 'En bref', en: 'At a glance' },
  legalDetails: { fr: 'Informations légales', en: 'Legal information' },
  legalName: { fr: 'Dénomination', en: 'Registered name' },
  legalForm: { fr: 'Forme juridique', en: 'Legal form' },
  registration: { fr: 'Immatriculation', en: 'Registration' },
  registeredAddress: { fr: 'Siège social', en: 'Registered office' },
  companyProducts: { fr: 'Produits proposés', en: 'Products' },
  companyProjects: { fr: 'Projets', en: 'Projects' },
  contactCompany: { fr: 'Contacter {name}', en: 'Contact {name}' },
  backToCompanies: { fr: '← Nos sociétés', en: '← Our companies' },

  // --- products -------------------------------------------------------------
  allProducts: { fr: 'Tout', en: 'All' },
  viewProduct: { fr: 'Découvrir le produit', en: 'Discover the product' },
  backToProducts: { fr: '← Nos produits', en: '← Our products' },
  productPhotos: { fr: 'Photographies du produit', en: 'Product photographs' },
  technicalInfo: { fr: 'Fiche technique', en: 'Technical information' },
  reference: { fr: 'Référence', en: 'Reference' },
  suppliedBy: { fr: 'Proposé par', en: 'Supplied by' },
  requestQuote: { fr: 'Demander un devis', en: 'Request a quotation' },
  contactTeam: { fr: 'Contacter notre équipe', en: 'Contact our team' },
  onlineStore: { fr: 'Boutique en ligne EAC', en: 'EAC online store' },
  productEnquiryNote: {
    fr: 'Pour les volumes, les conditionnements et les conditions commerciales, notre équipe vous répond directement.',
    en: 'For volumes, packaging and commercial terms, our team will answer you directly.',
  },
  noProducts: {
    fr: 'Aucun produit publié pour le moment.',
    en: 'No products published yet.',
  },

  // --- projects -------------------------------------------------------------
  statusPlanned: { fr: 'En préparation', en: 'Planned' },
  statusInProgress: { fr: 'En cours', en: 'In progress' },
  statusCompleted: { fr: 'Réalisé', en: 'Completed' },
  location: { fr: 'Lieu', en: 'Location' },
  period: { fr: 'Période', en: 'Period' },
  ledBy: { fr: 'Porté par', en: 'Led by' },
  backToProjects: { fr: '← Nos projets', en: '← Our projects' },
  noProjects: {
    fr: 'Aucun projet publié pour le moment.',
    en: 'No projects published yet.',
  },

  // --- partnerships ---------------------------------------------------------
  partnerCooperative: { fr: 'Coopératives et producteurs', en: 'Cooperatives and growers' },
  partnerLogistics: { fr: 'Logistique', en: 'Logistics' },
  partnerLaboratory: { fr: 'Laboratoires et certification', en: 'Laboratories and certification' },
  partnerDistributor: { fr: 'Distribution', en: 'Distribution' },
  partnerInstitutional: { fr: 'Institutions', en: 'Institutions' },
  partnerOther: { fr: 'Autres partenaires', en: 'Other partners' },
  becomePartner: { fr: 'Devenir partenaire', en: 'Become a partner' },

  // --- gallery ---------------------------------------------------------------
  photoCount: { fr: '{count} photographies', en: '{count} photographs' },
  openPhoto: { fr: 'Agrandir la photographie', en: 'Enlarge photograph' },
  noAlbums: {
    fr: 'Aucun album publié pour le moment.',
    en: 'No albums published yet.',
  },

  // --- news ------------------------------------------------------------------
  backToNews: { fr: '← Actualités', en: '← News' },
  noPosts: {
    fr: 'Aucune actualité publiée pour le moment.',
    en: 'No news published yet.',
  },
  readArticle: { fr: "Lire l'article", en: 'Read article' },
  latestArticle: { fr: 'À la une', en: 'Latest' },
  featured: { fr: 'À lire aussi', en: 'Also read' },
  allArticles: { fr: 'Toutes les actualités', en: 'All news' },
  subscribe: { fr: 'S’inscrire', en: 'Subscribe' },
  newsNewsletterPrompt: {
    fr: 'Recevez nos prochaines actualités par e-mail.',
    en: 'Get our next news by email.',
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

  // --- contact and enquiries -------------------------------------------------
  writeToUs: { fr: 'Écrivez-nous', en: 'Write to us' },
  ourOffices: { fr: 'Nos coordonnées', en: 'How to reach us' },
  enquiryType: { fr: 'Objet de votre demande', en: 'Your request' },
  typeQuote: { fr: 'Demande de devis', en: 'Quotation request' },
  typeCommercial: { fr: 'Demande commerciale', en: 'Commercial enquiry' },
  typePartnership: { fr: 'Partenariat', en: 'Partnership' },
  typeOther: { fr: 'Autre demande', en: 'Other' },
  fullName: { fr: 'Nom complet', en: 'Full name' },
  companyName: { fr: 'Société', en: 'Company' },
  emailAddress: { fr: 'Adresse e-mail', en: 'Email address' },
  phone: { fr: 'Téléphone', en: 'Phone' },
  country: { fr: 'Pays', en: 'Country' },
  product: { fr: 'Produit concerné', en: 'Product' },
  productNone: { fr: '— Aucun en particulier —', en: '— None in particular —' },
  volume: { fr: 'Volume estimé', en: 'Estimated volume' },
  volumeHint: { fr: 'Par exemple : 50 kg par mois', en: 'For example: 50 kg a month' },
  message: { fr: 'Message', en: 'Message' },
  optional: { fr: 'facultatif', en: 'optional' },
  consent: {
    fr: 'J’accepte que ces informations soient utilisées pour répondre à ma demande.',
    en: 'I agree that this information is used to answer my request.',
  },
  readPrivacy: { fr: 'Politique de confidentialité', en: 'Privacy policy' },
  sendEnquiry: { fr: 'Envoyer ma demande', en: 'Send my request' },
  enquiryThanks: {
    fr: 'Merci, votre demande a bien été reçue. Notre équipe vous répondra rapidement.',
    en: 'Thank you, your request has been received. Our team will get back to you shortly.',
  },
  enquiryDemoNote: {
    fr: 'Démonstration : la demande est enregistrée dans l’administration, aucun e-mail n’est envoyé.',
    en: 'Demonstration: the request is saved in the administration area; no email is sent.',
  },
  errRequired: { fr: 'Champ obligatoire.', en: 'This field is required.' },
  errEmail: { fr: 'Adresse e-mail invalide.', en: 'Invalid email address.' },
  errConsent: {
    fr: 'Merci de cocher cette case pour envoyer votre demande.',
    en: 'Please tick this box to send your request.',
  },
  errFixForm: {
    fr: 'Vérifiez les champs signalés.',
    en: 'Please check the highlighted fields.',
  },

  // --- page furniture ---------------------------------------------------------
  skipToContent: { fr: 'Aller au contenu', en: 'Skip to content' },
  demoNotice: {
    fr: 'Démonstration — contenu fictif',
    en: 'Demonstration — sample content',
  },
} satisfies Record<string, Record<Locale, string>>

export type StringKey = keyof typeof STRINGS

export const t = (key: StringKey, locale: Locale): string => STRINGS[key][locale]

/** Labels for the project statuses chosen in the administration area. */
export const PROJECT_STATUS_KEYS = {
  planned: 'statusPlanned',
  'in-progress': 'statusInProgress',
  completed: 'statusCompleted',
} as const satisfies Record<string, StringKey>

/** Headings for the partner types, in the order the page lists them. */
export const PARTNER_TYPE_KEYS = {
  cooperative: 'partnerCooperative',
  logistics: 'partnerLogistics',
  laboratory: 'partnerLaboratory',
  distributor: 'partnerDistributor',
  institutional: 'partnerInstitutional',
  other: 'partnerOther',
} as const satisfies Record<string, StringKey>

/** Fills a "{name}" placeholder in one of the strings above. */
export const fill = (text: string, values: Record<string, string>): string =>
  text.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match)

/** The other language, for the switcher in the header. */
export const otherLocale = (locale: Locale): Locale => (locale === 'fr' ? 'en' : 'fr')

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
