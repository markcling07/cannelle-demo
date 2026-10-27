/**
 * Sample institutional content for the demonstration: the companies, the
 * team, projects, partners, gallery, news and the words on each page.
 *
 * All of it is fictional, as agreed. Legal identifiers are left as visible
 * placeholders rather than invented numbers, and the founder's biography is
 * a placeholder too: it will be written and validated by the Group.
 */

export type Bilingual = { fr: string; en: string }

const TBC: Bilingual = { fr: 'À compléter', en: 'To be provided' }

// --- companies ---------------------------------------------------------------

export type CompanySeed = {
  key: 'mfc' | 'eac'
  shortName: string
  name: string
  initials: string
  colour: string
  cover: string
  order: number
  email: string
  phone: string
  registeredAddress: string
  country: Bilingual
  tagline: Bilingual
  summary: Bilingual
  body: { fr: string[]; en: string[] }
  facts: { fr: { label: string; value: string }[]; en: { label: string; value: string }[] }
  address: Bilingual
}

export const companies: CompanySeed[] = [
  {
    key: 'mfc',
    shortName: 'MFC',
    name: 'Madagascar Fragrances Company',
    initials: 'MFC',
    colour: '#1d3d23',
    cover: 'journal-cacao-fermentation',
    order: 1,
    email: 'mfc@demo.local',
    phone: '+261 00 00 000 00',
    registeredAddress: 'Antananarivo, Madagascar — adresse complète à compléter / full address to be provided',
    country: { fr: 'Madagascar', en: 'Madagascar' },
    tagline: {
      fr: 'Approvisionnement, préparation et export depuis Madagascar',
      en: 'Sourcing, processing and export from Madagascar',
    },
    summary: {
      fr: 'MFC travaille au plus près des producteurs de la SAVA, de Nosy Be et de la côte est. Elle sélectionne, prépare et exporte la vanille, les huiles essentielles et les épices proposées sous la marque du Groupe.',
      en: 'MFC works closely with growers in SAVA, Nosy Be and along the east coast. It selects, prepares and exports the vanilla, essential oils and spices offered under the Group brand.',
    },
    body: {
      fr: [
        'Madagascar Fragrances Company est une société de droit malgache. Elle achète directement auprès de coopératives et de producteurs, contrôle chaque lot et en assure la préparation : affinage de la vanille, distillation, tri et séchage des épices.',
        'Son équipe qualité suit chaque étape, de la récolte à l’expédition, et prépare la documentation demandée par les clients professionnels : fiches techniques, certificats d’analyse, origine.',
        'Texte de démonstration : la présentation définitive de MFC sera fournie et validée par la société.',
      ],
      en: [
        'Madagascar Fragrances Company is a company incorporated in Madagascar. It buys directly from cooperatives and growers, checks every lot and handles the preparation: vanilla curing, distillation, sorting and drying of spices.',
        'Its quality team follows every step from harvest to shipment, and prepares the documents professional buyers ask for: technical sheets, certificates of analysis, origin.',
        'Sample text: the final presentation of MFC will be supplied and approved by the company.',
      ],
    },
    facts: {
      fr: [
        { label: 'Activités', value: 'Vanille, huiles essentielles, épices' },
        { label: 'Approvisionnement', value: 'SAVA, Nosy Be, côte est' },
        { label: 'Implantation', value: 'Antananarivo' },
        { label: 'Clients', value: 'Professionnels, à l’export' },
      ],
      en: [
        { label: 'Activities', value: 'Vanilla, essential oils, spices' },
        { label: 'Sourcing', value: 'SAVA, Nosy Be, east coast' },
        { label: 'Based in', value: 'Antananarivo' },
        { label: 'Customers', value: 'Professional buyers, for export' },
      ],
    },
    address: { fr: 'Antananarivo\nMadagascar', en: 'Antananarivo\nMadagascar' },
  },
  {
    key: 'eac',
    shortName: 'EAC',
    name: 'EURUSA AFRASIA CORPORATION',
    initials: 'EAC',
    colour: '#8a6226',
    cover: 'journal-conserver-epices',
    order: 2,
    email: 'eac@demo.local',
    phone: '+33 1 00 00 00 00',
    registeredAddress: 'France — adresse complète à compléter / full address to be provided',
    country: { fr: 'France', en: 'France' },
    tagline: {
      fr: 'Import, distribution et relations commerciales en Europe',
      en: 'Import, distribution and commercial relations in Europe',
    },
    summary: {
      fr: 'Établie en France, EAC importe et distribue en Europe une sélection de produits naturels de Madagascar. Elle accompagne les clients professionnels — échantillons, devis, logistique — et prépare une boutique en ligne.',
      en: 'Based in France, EAC imports and distributes a selection of natural products from Madagascar across Europe. It looks after professional customers — samples, quotations, logistics — and is preparing an online store.',
    },
    body: {
      fr: [
        'EURUSA AFRASIA CORPORATION est une société de droit français. Elle est l’interlocuteur des clients européens : demandes de devis, envoi d’échantillons, organisation des livraisons et suivi après-vente.',
        'EAC prépare également une boutique en ligne, qui permettra de commander certains produits directement. Les fiches produits du site pourront y renvoyer dès son ouverture.',
        'Texte de démonstration : la présentation définitive d’EAC sera fournie et validée par la société.',
      ],
      en: [
        'EURUSA AFRASIA CORPORATION is a company incorporated in France. It is the point of contact for European customers: quotation requests, samples, delivery arrangements and after-sales follow-up.',
        'EAC is also preparing an online store, where some products can be ordered directly. The product pages on this site will be able to link to it as soon as it opens.',
        'Sample text: the final presentation of EAC will be supplied and approved by the company.',
      ],
    },
    facts: {
      fr: [
        { label: 'Activités', value: 'Import, distribution, service client' },
        { label: 'Clients', value: 'Industriels, artisans, épiceries fines' },
        { label: 'Marchés', value: 'Union européenne' },
        { label: 'Boutique en ligne', value: 'En préparation' },
      ],
      en: [
        { label: 'Activities', value: 'Import, distribution, customer service' },
        { label: 'Customers', value: 'Manufacturers, artisans, delicatessens' },
        { label: 'Markets', value: 'European Union' },
        { label: 'Online store', value: 'In preparation' },
      ],
    },
    address: { fr: 'France', en: 'France' },
  },
]

export const legalPlaceholders = { legalForm: TBC, registration: 'À compléter / To be provided' }

// --- team -------------------------------------------------------------------------

export type TeamSeed = {
  name: string
  initials: string
  colour: string
  company: 'mfc' | 'eac' | null
  founder?: boolean
  order: number
  role: Bilingual
  bio: Bilingual
}

export const team: TeamSeed[] = [
  {
    name: 'Nom du fondateur · Founder’s name',
    initials: 'GJ',
    colour: '#15301b',
    company: null,
    founder: true,
    order: 0,
    role: { fr: 'Fondateur de GROUPE JAOVAZAHA', en: 'Founder of GROUPE JAOVAZAHA' },
    bio: {
      fr: 'Emplacement réservé. La présentation du fondateur — son parcours, sa vision pour le Groupe et ses sociétés — sera rédigée et validée par GROUPE JAOVAZAHA.\n\nCe texte se modifie dans l’administration : Groupe et sociétés → Fondateur et direction.',
      en: 'Placeholder. The founder’s presentation — background, and vision for the Group and its companies — will be written and approved by GROUPE JAOVAZAHA.\n\nThis text is edited in the administration area: Group and companies → Founder and management.',
    },
  },
  {
    name: 'Mialy Razafindrabe',
    initials: 'MR',
    colour: '#2b5633',
    company: null,
    order: 1,
    role: { fr: 'Coordinatrice du Groupe', en: 'Group coordinator' },
    bio: {
      fr: 'Profil fictif. Veille à la cohérence de la marque commune et à la coordination entre les sociétés.',
      en: 'Fictional profile. Looks after the shared brand and coordination between the companies.',
    },
  },
  {
    name: 'Hanta Rakoto',
    initials: 'HR',
    colour: '#1d3d23',
    company: 'mfc',
    order: 2,
    role: { fr: 'Directrice générale', en: 'Managing Director' },
    bio: {
      fr: 'Profil fictif. Dirige les opérations de MFC à Madagascar, des achats à l’expédition.',
      en: 'Fictional profile. Runs MFC’s operations in Madagascar, from purchasing to shipment.',
    },
  },
  {
    name: 'Tojo Andrianaivo',
    initials: 'TA',
    colour: '#4f6b3a',
    company: 'mfc',
    order: 3,
    role: { fr: 'Responsable qualité et approvisionnement', en: 'Head of quality and sourcing' },
    bio: {
      fr: 'Profil fictif. Suit les producteurs partenaires et le contrôle de chaque lot.',
      en: 'Fictional profile. Works with partner growers and oversees the checks on every lot.',
    },
  },
  {
    name: 'Léa Marchand',
    initials: 'LM',
    colour: '#8a6226',
    company: 'eac',
    order: 4,
    role: { fr: 'Directrice commerciale Europe', en: 'Sales Director, Europe' },
    bio: {
      fr: 'Profil fictif. Accompagne les clients professionnels européens, du premier échantillon à la livraison.',
      en: 'Fictional profile. Looks after European business customers, from the first sample to delivery.',
    },
  },
]

// --- projects -----------------------------------------------------------------------

export type ProjectSeed = {
  cover: string
  status: 'planned' | 'in-progress' | 'completed'
  company: 'mfc' | 'eac' | null
  order: number
  fr: { title: string; summary: string; location: string; period: string; body: string[] }
  en: { title: string; summary: string; location: string; period: string; body: string[] }
}

export const projects: ProjectSeed[] = [
  {
    cover: 'vanille-bourbon-2',
    status: 'in-progress',
    company: 'mfc',
    order: 1,
    fr: {
      title: 'Traçabilité de la vanille de la SAVA',
      summary: 'Identifier chaque lot de vanille, du village de production jusqu’au client final.',
      location: 'Région SAVA, Madagascar',
      period: '2025 – 2027',
      body: [
        'Projet fictif, présenté pour la démonstration.',
        'Chaque lot reçoit un identifiant dès l’achat auprès des producteurs. Les étapes de préparation — échaudage, étuvage, séchage, affinage — y sont rattachées, ainsi que les résultats des contrôles.',
        'Les clients professionnels pourront consulter ces informations avec la fiche technique de leur commande.',
      ],
    },
    en: {
      title: 'SAVA vanilla traceability',
      summary: 'Identifying every lot of vanilla, from the growing village to the end customer.',
      location: 'SAVA region, Madagascar',
      period: '2025 – 2027',
      body: [
        'Fictional project, shown for the demonstration.',
        'Every lot is given an identifier when it is bought from growers. Each preparation step — blanching, sweating, drying, conditioning — is linked to it, together with the results of quality checks.',
        'Professional customers will be able to see this information alongside the technical sheet for their order.',
      ],
    },
  },
  {
    cover: 'ylang-ylang-2',
    status: 'planned',
    company: 'mfc',
    order: 2,
    fr: {
      title: 'Modernisation de la distillation d’ylang-ylang',
      summary: 'Des alambics plus économes en bois et un meilleur contrôle des fractions.',
      location: 'Nosy Be, Madagascar',
      period: '2026 – 2028',
      body: [
        'Projet fictif, présenté pour la démonstration.',
        'Avec des distillateurs partenaires, MFC étudie le remplacement d’alambics anciens par des équipements consommant moins de bois, et un suivi plus précis de chaque fraction.',
      ],
    },
    en: {
      title: 'Upgrading ylang-ylang distillation',
      summary: 'Stills that burn less wood, and better control of each fraction.',
      location: 'Nosy Be, Madagascar',
      period: '2026 – 2028',
      body: [
        'Fictional project, shown for the demonstration.',
        'With partner distillers, MFC is studying how to replace old stills with equipment that uses less wood, and how to monitor each fraction more precisely.',
      ],
    },
  },
  {
    cover: 'gingembre-2',
    status: 'planned',
    company: 'eac',
    order: 3,
    fr: {
      title: 'Logistique européenne et boutique en ligne',
      summary: 'Un stock en France pour livrer plus vite, et une boutique en ligne pour certains produits.',
      location: 'France',
      period: '2026',
      body: [
        'Projet fictif, présenté pour la démonstration.',
        'EAC prévoit un stock tampon en France afin de raccourcir les délais de livraison en Europe, ainsi qu’une boutique en ligne. Les fiches produits de ce site pourront y renvoyer.',
      ],
    },
    en: {
      title: 'European logistics and online store',
      summary: 'Stock in France for faster delivery, and an online store for selected products.',
      location: 'France',
      period: '2026',
      body: [
        'Fictional project, shown for the demonstration.',
        'EAC plans to hold buffer stock in France to shorten delivery times across Europe, and to open an online store. The product pages on this site will be able to link to it.',
      ],
    },
  },
  {
    cover: 'clous-de-girofle-2',
    status: 'completed',
    company: null,
    order: 4,
    fr: {
      title: 'Charte qualité commune',
      summary: 'Des exigences partagées par toutes les sociétés du Groupe.',
      location: 'Madagascar et France',
      period: '2025',
      body: [
        'Projet fictif, présenté pour la démonstration.',
        'La charte fixe des règles communes : relations avec les producteurs, contrôles avant expédition, documentation remise aux clients. Chaque société l’applique sous sa propre responsabilité.',
      ],
    },
    en: {
      title: 'Shared quality charter',
      summary: 'Standards shared by every company in the Group.',
      location: 'Madagascar and France',
      period: '2025',
      body: [
        'Fictional project, shown for the demonstration.',
        'The charter sets common rules: relations with growers, checks before shipment, documentation provided to customers. Each company applies it under its own responsibility.',
      ],
    },
  },
]

// --- partners -----------------------------------------------------------------------

export type PartnerSeed = {
  name: string
  initials: string
  colour: string
  type: 'cooperative' | 'logistics' | 'laboratory' | 'distributor' | 'institutional' | 'other'
  order: number
  country: Bilingual
  description: Bilingual
}

export const partners: PartnerSeed[] = [
  {
    name: 'Coopérative Tsara Vanilla',
    initials: 'TV',
    colour: '#2b5633',
    type: 'cooperative',
    order: 1,
    country: { fr: 'Madagascar', en: 'Madagascar' },
    description: {
      fr: 'Partenaire fictif. Une centaine de producteurs de vanille de la SAVA.',
      en: 'Fictional partner. Around a hundred vanilla growers in SAVA.',
    },
  },
  {
    name: 'Nosy Fleurs Distillation',
    initials: 'NF',
    colour: '#6b4f8a',
    type: 'cooperative',
    order: 2,
    country: { fr: 'Madagascar', en: 'Madagascar' },
    description: {
      fr: 'Partenaire fictif. Cueillette et distillation d’ylang-ylang à Nosy Be.',
      en: 'Fictional partner. Ylang-ylang picking and distillation on Nosy Be.',
    },
  },
  {
    name: 'Océan Indien Fret',
    initials: 'OI',
    colour: '#2f5d7c',
    type: 'logistics',
    order: 3,
    country: { fr: 'Madagascar et France', en: 'Madagascar and France' },
    description: {
      fr: 'Partenaire fictif. Transport maritime et aérien entre Toamasina et l’Europe.',
      en: 'Fictional partner. Sea and air freight between Toamasina and Europe.',
    },
  },
  {
    name: 'Laboratoire Qualis Analyse',
    initials: 'QA',
    colour: '#8a6226',
    type: 'laboratory',
    order: 4,
    country: { fr: 'France', en: 'France' },
    description: {
      fr: 'Partenaire fictif. Analyses de vanilline, d’humidité et de résidus.',
      en: 'Fictional partner. Testing for vanillin, moisture and residues.',
    },
  },
  {
    name: 'Maison Épices Europe',
    initials: 'ME',
    colour: '#7a3b2a',
    type: 'distributor',
    order: 5,
    country: { fr: 'Belgique', en: 'Belgium' },
    description: {
      fr: 'Partenaire fictif. Distribution auprès des épiceries fines du Benelux.',
      en: 'Fictional partner. Distribution to delicatessens across the Benelux.',
    },
  },
]

// --- gallery ------------------------------------------------------------------------

export type AlbumSeed = { photos: string[]; date: string; order: number; title: Bilingual; description: Bilingual }

export const albums: AlbumSeed[] = [
  {
    photos: ['journal-vanille-affinage', 'vanille-bourbon', 'vanille-bourbon-2', 'vanille-bourbon-3', 'vanille-bourbon-4'],
    date: '2026-07-01',
    order: 1,
    title: { fr: 'Vanille, de la gousse à l’affinage', en: 'Vanilla, from pod to curing' },
    description: {
      fr: 'Photographies de démonstration. Elles seront remplacées par les photographies officielles du Groupe.',
      en: 'Sample photographs. They will be replaced by the Group’s official photography.',
    },
  },
  {
    photos: ['ylang-ylang', 'ylang-ylang-3', 'clous-de-girofle', 'clous-de-girofle-3', 'poivre-noir', 'poivre-noir-3', 'baies-roses', 'curcuma-2'],
    date: '2026-05-01',
    order: 2,
    title: { fr: 'Huiles essentielles et épices', en: 'Essential oils and spices' },
    description: {
      fr: 'Ylang-ylang, girofle, poivres et curcuma.',
      en: 'Ylang-ylang, cloves, peppers and turmeric.',
    },
  },
  {
    photos: ['journal-cacao-fermentation', 'cacao', 'cacao-2', 'cacao-3', 'cacao-4'],
    date: '2026-03-01',
    order: 3,
    title: { fr: 'Cacao du Sambirano', en: 'Sambirano cocoa' },
    description: {
      fr: 'Cabosses, fermentation et fèves séchées.',
      en: 'Pods, fermentation and dried beans.',
    },
  },
]

// --- news ---------------------------------------------------------------------------

export type NewsSeed = {
  slug: string
  cover: string
  coverAlt: Bilingual
  daysAgo: number
  fr: { title: string; excerpt: string; body: string[] }
  en: { title: string; excerpt: string; body: string[] }
}

export const NEWS_AUTHOR = { name: 'Communication GROUPE JAOVAZAHA', initials: 'GJ', colour: '#15301b' }

export const news: NewsSeed[] = [
  {
    slug: 'identite-commune',
    cover: 'journal-conserver-epices',
    coverAlt: { fr: 'Bocaux d’épices en verre sur une étagère', en: 'Glass jars of spices on a shelf' },
    daysAgo: 3,
    fr: {
      title: 'GROUPE JAOVAZAHA, une identité commune pour MFC et EAC',
      excerpt:
        'Une marque partagée relie désormais nos activités à Madagascar et en France, sans rien changer à l’indépendance juridique de chaque société.',
      body: [
        'Actualité fictive, présentée pour la démonstration.',
        'GROUPE JAOVAZAHA rassemble sous une même identité Madagascar Fragrances Company (MFC), à Madagascar, et EURUSA AFRASIA CORPORATION (EAC), en France.',
        'Ce n’est pas une société holding : chaque société conserve sa propre existence juridique, ses responsables et ses engagements. Les devis, contrats et factures sont toujours émis par la société concernée.',
        'Le nouveau site présente cette organisation, les produits proposés et les projets en cours.',
      ],
    },
    en: {
      title: 'GROUPE JAOVAZAHA, a shared identity for MFC and EAC',
      excerpt:
        'A shared brand now connects our activities in Madagascar and in France, without changing the legal independence of either company.',
      body: [
        'Fictional news item, shown for the demonstration.',
        'GROUPE JAOVAZAHA brings Madagascar Fragrances Company (MFC), in Madagascar, and EURUSA AFRASIA CORPORATION (EAC), in France, together under one identity.',
        'It is not a holding company: each company keeps its own legal existence, management and commitments. Quotations, contracts and invoices are always issued by the company concerned.',
        'The new website presents this organisation, the products on offer and the projects under way.',
      ],
    },
  },
  {
    slug: 'campagne-vanille',
    cover: 'journal-vanille-affinage',
    coverAlt: { fr: 'Gousses de vanille noires et souples', en: 'Supple black vanilla pods' },
    daysAgo: 12,
    fr: {
      title: 'Ouverture de la campagne de préparation de la vanille dans la SAVA',
      excerpt: 'Échaudage, étuvage, séchage : MFC et ses producteurs partenaires lancent la préparation de la nouvelle récolte.',
      body: [
        'Actualité fictive, présentée pour la démonstration.',
        'La récolte terminée, les gousses vertes sont échaudées, mises à suer en caisses, puis séchées au soleil pendant plusieurs semaines. L’affinage se poursuit ensuite pendant deux à trois mois.',
        'Cette année, chaque lot est suivi dans le cadre du programme de traçabilité lancé par MFC.',
      ],
    },
    en: {
      title: 'The vanilla curing season opens in SAVA',
      excerpt: 'Blanching, sweating, drying: MFC and its partner growers begin preparing the new harvest.',
      body: [
        'Fictional news item, shown for the demonstration.',
        'Once harvested, the green pods are blanched, sweated in boxes, then dried in the sun over several weeks. Conditioning then continues for two to three months.',
        'This year every lot is followed through MFC’s traceability programme.',
      ],
    },
  },
  {
    slug: 'cacao-fermentation',
    cover: 'journal-cacao-fermentation',
    coverAlt: { fr: 'Cabosse de cacao ouverte, fèves dans leur pulpe', en: 'An open cacao pod, beans in their pulp' },
    daysAgo: 26,
    fr: {
      title: 'Cacao : un suivi renforcé de la fermentation',
      excerpt: 'Avec ses partenaires du Sambirano, MFC contrôle désormais chaque lot par une coupe d’échantillons avant séchage.',
      body: [
        'Actualité fictive, présentée pour la démonstration.',
        'Une fève bien fermentée est brune et fissurée à l’intérieur ; une fève grise et compacte ne l’a pas été. Le test de coupe permet de le vérifier sur chaque lot avant le séchage.',
        'Les résultats sont joints à la documentation remise aux clients professionnels.',
      ],
    },
    en: {
      title: 'Cocoa: closer checks on fermentation',
      excerpt: 'With its partners in the Sambirano, MFC now checks every lot with a cut test before drying.',
      body: [
        'Fictional news item, shown for the demonstration.',
        'A well-fermented bean is brown and cracked inside; a grey, dense bean was not fermented. The cut test checks this on every lot before drying.',
        'The results are included in the documents provided to professional customers.',
      ],
    },
  },
  {
    slug: 'salon-professionnel',
    cover: 'journal-ceylan-cassia',
    coverAlt: { fr: 'Bâtons d’épices sur un linge clair', en: 'Spice sticks on pale linen' },
    daysAgo: 40,
    fr: {
      title: 'EAC présentera la sélection du Groupe à un salon professionnel',
      excerpt: 'Vanille, huiles essentielles et épices : rendez-vous avec les acheteurs européens.',
      body: [
        'Actualité fictive, présentée pour la démonstration.',
        'L’équipe d’EAC y présentera la sélection de produits du Groupe et recevra les demandes d’échantillons et de devis.',
        'Les rendez-vous peuvent être demandés à l’avance depuis la page Contact.',
      ],
    },
    en: {
      title: 'EAC to present the Group’s selection at a trade fair',
      excerpt: 'Vanilla, essential oils and spices: meeting European buyers.',
      body: [
        'Fictional news item, shown for the demonstration.',
        'EAC’s team will present the Group’s selection and take requests for samples and quotations.',
        'Meetings can be booked in advance from the Contact page.',
      ],
    },
  },
]

// --- page texts -------------------------------------------------------------------

export const siteSettings = {
  fr: {
    tagline: 'Relier Madagascar au monde',
    footerNote:
      'GROUPE JAOVAZAHA est une marque commune. Madagascar Fragrances Company (Madagascar) et EURUSA AFRASIA CORPORATION (France) sont des sociétés juridiquement indépendantes.',
    newsletterHeading: 'Recevez les actualités\ndu Groupe et de ses sociétés',
    address: 'Antananarivo, Madagascar\nFrance',
  },
  en: {
    tagline: 'Connecting Madagascar to the world',
    footerNote:
      'GROUPE JAOVAZAHA is a shared brand. Madagascar Fragrances Company (Madagascar) and EURUSA AFRASIA CORPORATION (France) are legally independent companies.',
    newsletterHeading: 'Get news from the Group\nand its companies',
    address: 'Antananarivo, Madagascar\nFrance',
  },
  contactEmail: 'contact@demo.local',
  contactPhone: '+33 1 00 00 00 00',
}

export const homePage = {
  fr: {
    hero: {
      eyebrow: 'Madagascar · France',
      title: 'Relier Madagascar au monde',
      text: 'GROUPE JAOVAZAHA réunit, sous une même marque, des sociétés indépendantes qui sélectionnent, préparent et distribuent la vanille, les huiles essentielles et les épices de Madagascar.',
    },
    structure: {
      title: 'Une marque commune, des sociétés indépendantes',
      text: 'GROUPE JAOVAZAHA est l’identité commune qui relie nos activités à Madagascar et en France. Chaque société conserve sa propre existence juridique, ses responsables et ses engagements.',
      note: 'GROUPE JAOVAZAHA est une marque commune et non une société holding. Madagascar Fragrances Company (MFC), immatriculée à Madagascar, et EURUSA AFRASIA CORPORATION (EAC), immatriculée en France, sont des entreprises juridiquement indépendantes. Les devis, contrats et factures sont toujours émis par la société concernée.',
    },
    closing: {
      title: 'Un projet, une demande de devis ?',
      text: 'Dites-nous ce dont vous avez besoin — produit, volume, conditionnement, destination. La société du Groupe concernée vous répond.',
    },
  },
  en: {
    hero: {
      eyebrow: 'Madagascar · France',
      title: 'Connecting Madagascar to the world',
      text: 'GROUPE JAOVAZAHA brings together, under one brand, independent companies that select, prepare and distribute vanilla, essential oils and spices from Madagascar.',
    },
    structure: {
      title: 'One shared brand, independent companies',
      text: 'GROUPE JAOVAZAHA is the shared identity that connects our activities in Madagascar and in France. Each company keeps its own legal existence, management and commitments.',
      note: 'GROUPE JAOVAZAHA is a shared brand, not a holding company. Madagascar Fragrances Company (MFC), registered in Madagascar, and EURUSA AFRASIA CORPORATION (EAC), registered in France, are legally independent businesses. Quotations, contracts and invoices are always issued by the company concerned.',
    },
    closing: {
      title: 'A project or a quotation request?',
      text: 'Tell us what you need — product, volume, packaging, destination. The Group company concerned will answer you.',
    },
  },
  heroImage: 'journal-vanille-affinage',
  featured: ['vanille-bourbon', 'ylang-ylang', 'clous-de-girofle', 'cacao', 'poivre-noir', 'baies-roses'],
}

export const aboutPage = {
  image: 'journal-ceylan-cassia',
  fr: {
    title: 'À propos de GROUPE JAOVAZAHA',
    intro:
      'Une identité commune pour des sociétés qui partagent une même exigence : faire connaître les produits naturels de Madagascar, dans le respect des producteurs et des clients.',
    body: [
      'Texte de démonstration. La présentation définitive du Groupe sera fournie et validée par GROUPE JAOVAZAHA.',
      'GROUPE JAOVAZAHA est né d’une conviction : la vanille, les huiles essentielles et les épices de Madagascar méritent une filière exigeante, de la plantation jusqu’au client.',
      'Le Groupe n’est pas une société holding. C’est une marque commune, qui relie aujourd’hui deux sociétés juridiquement indépendantes : Madagascar Fragrances Company (MFC) à Madagascar, et EURUSA AFRASIA CORPORATION (EAC) en France. D’autres projets pourront la rejoindre.',
      'Ce qui les rassemble : des valeurs partagées, une charte qualité commune et la même attention portée aux producteurs partenaires.',
    ],
    values: [
      { title: 'Intégrité', text: 'Des engagements tenus, des informations exactes, des relations claires avec chacun.' },
      { title: 'Qualité', text: 'Des contrôles à chaque étape, de la récolte à l’expédition.' },
      { title: 'Partenariat', text: 'Des relations durables avec les producteurs, les prestataires et les clients.' },
      { title: 'Durabilité', text: 'Des pratiques qui préservent les ressources et les savoir-faire de Madagascar.' },
    ],
  },
  en: {
    title: 'About GROUPE JAOVAZAHA',
    intro:
      'A shared identity for companies with the same standards: bringing Madagascar’s natural products to the world, with respect for growers and customers.',
    body: [
      'Sample text. The final presentation of the Group will be supplied and approved by GROUPE JAOVAZAHA.',
      'GROUPE JAOVAZAHA grew from one conviction: Madagascar’s vanilla, essential oils and spices deserve a demanding supply chain, from the plantation to the customer.',
      'The Group is not a holding company. It is a shared brand that today connects two legally independent companies: Madagascar Fragrances Company (MFC) in Madagascar, and EURUSA AFRASIA CORPORATION (EAC) in France. Further projects may join it.',
      'What brings them together: shared values, a common quality charter and the same care for partner growers.',
    ],
    values: [
      { title: 'Integrity', text: 'Commitments kept, accurate information, clear relations with everyone.' },
      { title: 'Quality', text: 'Checks at every step, from harvest to shipment.' },
      { title: 'Partnership', text: 'Lasting relations with growers, service providers and customers.' },
      { title: 'Sustainability', text: 'Practices that protect Madagascar’s resources and know-how.' },
    ],
  },
}

export const legalPages = {
  fr: {
    legalNotice: {
      title: 'Mentions légales',
      body: [
        'Site de démonstration — contenu fictif. Les mentions ci-dessous sont à compléter et à faire valider par un juriste avant la mise en ligne définitive.',
        'Éditeur du site : à compléter (société éditrice, forme juridique, capital, numéro d’immatriculation, adresse du siège).',
        'Directeur de la publication : à compléter.',
        'Hébergeur : Vercel Inc. — coordonnées complètes à reporter depuis la page légale de l’hébergeur.',
        'GROUPE JAOVAZAHA est une marque commune. Madagascar Fragrances Company (MFC) et EURUSA AFRASIA CORPORATION (EAC) sont des sociétés juridiquement indépendantes ; leurs informations légales figurent sur leurs pages respectives.',
        'Propriété intellectuelle : les textes, logos et photographies de ce site ne peuvent être reproduits sans autorisation.',
      ],
    },
    privacy: {
      title: 'Politique de confidentialité',
      body: [
        'Site de démonstration — contenu fictif. Cette politique est à compléter et à faire valider par un juriste avant la mise en ligne définitive.',
        'Responsable du traitement : à compléter (la société du Groupe qui reçoit les demandes).',
        'Données collectées : celles saisies dans le formulaire de contact (nom, société, adresse e-mail, téléphone, pays, message) et, pour la lettre d’information, l’adresse e-mail.',
        'Finalité : répondre aux demandes de devis, demandes commerciales et propositions de partenariat ; envoyer la lettre d’information aux personnes inscrites.',
        'Durée de conservation : à définir (par exemple trois ans après le dernier contact).',
        'Vos droits : accès, rectification, effacement, opposition et portabilité, en écrivant à l’adresse de contact du site. Vous pouvez également saisir l’autorité de protection des données compétente (en France, la CNIL).',
        'Cookies : ce site de démonstration n’utilise aucun cookie de mesure d’audience ni de publicité.',
      ],
    },
  },
  en: {
    legalNotice: {
      title: 'Legal notice',
      body: [
        'Demonstration site — sample content. The information below must be completed and checked by a lawyer before the final launch.',
        'Publisher: to be provided (publishing company, legal form, share capital, registration number, registered office).',
        'Publication director: to be provided.',
        'Host: Vercel Inc. — full details to be copied from the host’s legal page.',
        'GROUPE JAOVAZAHA is a shared brand. Madagascar Fragrances Company (MFC) and EURUSA AFRASIA CORPORATION (EAC) are legally independent companies; their legal details are on their own pages.',
        'Intellectual property: the texts, logos and photographs on this site may not be reproduced without permission.',
      ],
    },
    privacy: {
      title: 'Privacy policy',
      body: [
        'Demonstration site — sample content. This policy must be completed and checked by a lawyer before the final launch.',
        'Data controller: to be provided (the Group company that receives the requests).',
        'Data collected: what is entered in the contact form (name, company, email address, phone, country, message) and, for the newsletter, the email address.',
        'Purpose: answering quotation requests, commercial enquiries and partnership proposals; sending the newsletter to subscribers.',
        'Retention: to be defined (for example three years after the last contact).',
        'Your rights: access, rectification, erasure, objection and portability, by writing to the site’s contact address. You may also contact the competent data protection authority (in France, the CNIL).',
        'Cookies: this demonstration site uses no analytics or advertising cookies.',
      ],
    },
  },
}

export const sectionIntros = {
  fr: {
    companies: {
      title: 'Nos sociétés',
      intro: 'Deux sociétés juridiquement indépendantes, réunies sous la marque GROUPE JAOVAZAHA.',
    },
    leadership: {
      title: 'Fondateur et direction',
      intro: 'Les personnes qui portent le Groupe et ses sociétés, à Madagascar et en France.',
    },
    projects: {
      title: 'Nos projets',
      intro: 'Ce que le Groupe et ses sociétés construisent, aujourd’hui et pour demain.',
    },
    partnerships: {
      title: 'Partenariats',
      intro: 'Producteurs, transporteurs, laboratoires, distributeurs : ceux avec qui nous travaillons.',
    },
    products: {
      title: 'Nos produits',
      intro: 'Un catalogue professionnel de produits naturels de Madagascar. Pour un devis, un échantillon ou une fiche technique, contactez notre équipe.',
    },
    news: {
      title: 'Actualités',
      intro: 'Les nouvelles du Groupe, de MFC et d’EAC : récoltes, projets, rendez-vous professionnels.',
      statement: 'De Madagascar à l’Europe :',
      accent: 'les nouvelles du Groupe et de ses sociétés.',
    },
    gallery: {
      title: 'Galerie',
      intro: 'Plantations, préparation, produits : quelques images de nos activités.',
    },
    contact: {
      title: 'Contact',
      intro: 'Une demande de devis, une question commerciale, une proposition de partenariat ? Écrivez-nous : la société du Groupe concernée vous répondra.',
    },
  },
  en: {
    companies: {
      title: 'Our companies',
      intro: 'Two legally independent companies, brought together under the GROUPE JAOVAZAHA brand.',
    },
    leadership: {
      title: 'Founder and management',
      intro: 'The people behind the Group and its companies, in Madagascar and in France.',
    },
    projects: {
      title: 'Our projects',
      intro: 'What the Group and its companies are building, today and for the future.',
    },
    partnerships: {
      title: 'Partnerships',
      intro: 'Growers, carriers, laboratories, distributors: the people we work with.',
    },
    products: {
      title: 'Our products',
      intro: 'A professional catalogue of natural products from Madagascar. For a quotation, a sample or a technical sheet, contact our team.',
    },
    news: {
      title: 'News',
      intro: 'News from the Group, MFC and EAC: harvests, projects, trade events.',
      statement: 'From Madagascar to Europe:',
      accent: 'news from the Group and its companies.',
    },
    gallery: {
      title: 'Gallery',
      intro: 'Plantations, preparation, products: a few pictures of what we do.',
    },
    contact: {
      title: 'Contact',
      intro: 'A quotation request, a commercial question, a partnership proposal? Write to us: the Group company concerned will answer.',
    },
  },
}

// --- sample enquiries ---------------------------------------------------------------

export const enquiries = [
  {
    type: 'quote' as const,
    product: 'vanille-bourbon',
    name: 'Claire Dumont',
    company: 'Atelier pâtissier (fictif)',
    email: 'claire.dumont@example.com',
    country: 'France',
    volume: '2 kg par mois',
    message:
      'Bonjour, nous cherchons de la vanille Bourbon catégorie gourmet pour notre atelier. Pourriez-vous nous envoyer un devis et la fiche technique ? Merci.',
    language: 'fr' as const,
    status: 'new' as const,
    daysAgo: 1,
  },
  {
    type: 'partnership' as const,
    product: null,
    name: 'James Whitfield',
    company: 'Fine foods importer (fictitious)',
    email: 'james.whitfield@example.com',
    country: 'United Kingdom',
    volume: '',
    message:
      'Hello, we import fine foods into the UK and would like to discuss distributing your essential oils and spices. Could we arrange a call?',
    language: 'en' as const,
    status: 'in-progress' as const,
    notes: 'Exemple : appel prévu la semaine prochaine avec EAC.',
    daysAgo: 6,
  },
]
