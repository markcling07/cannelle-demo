/**
 * Fills the demonstration database with sample content.
 *
 *   npm run seed
 *
 * Safe to run repeatedly: it clears the companies, team, projects, partners,
 * products, categories, news, gallery, enquiries and photographs first, then
 * recreates them and rewrites every page's text. User accounts and newsletter
 * sign-ups are kept.
 *
 * Everything here is fictional sample content, as agreed for the demonstration.
 * The institutional texts live in ./institutional.ts.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '@payload-config'
import sharp from 'sharp'

import { richText } from './richText'
import { placeholderImage, avatarImage } from './placeholderImage'
import * as content from './institutional'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Real photographs live in src/seed/images, named after the product slug.
 * Drop files in there and the seed uses them instead of generated
 * placeholders, so real photography survives `npm run seed` rather than being
 * wiped by it.
 *
 *   coffret-decouverte.png     -> the main photograph
 *   coffret-decouverte-2.webp  -> first additional photograph
 *   coffret-decouverte-3.webp  -> second, and so on
 *
 * Numbering must not skip: the search stops at the first gap.
 *
 * Wide photographs used for banners, company covers and news follow the
 * same rule as `journal-<name>`, ideally 1600x1000 so they fill the 16:10
 * header exactly.
 */
const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

type Photo = { buffer: Buffer; ext: string }

const findPhoto = (name: string): Photo | null => {
  for (const ext of Object.keys(MIME)) {
    const file = path.resolve(dirname, 'images', `${name}.${ext}`)
    if (fs.existsSync(file)) return { buffer: fs.readFileSync(file), ext }
  }
  return null
}

const realPhoto = (slug: string): Photo | null => findPhoto(slug)

/** Everything after the main photograph, for the product's gallery. */
const extraPhotos = (slug: string): (Photo & { index: number })[] => {
  const found: (Photo & { index: number })[] = []

  for (let index = 2; index <= 8; index++) {
    const photo = findPhoto(`${slug}-${index}`)
    if (!photo) break
    found.push({ ...photo, index })
  }

  return found
}

/**
 * Credentials come from .env, which is never committed. There is deliberately
 * no fallback password: a default here would ship in the repository and would
 * still be in the git history long after anyone changed it — and the same seed
 * runs against the deployed database.
 */
const required = (name: string): string => {
  const value = process.env[name]

  if (!value) {
    console.error(
      `\nMissing ${name}.\n\n` +
        `Add these to .env, then run the seed again:\n\n` +
        `  SEED_ADMIN_EMAIL=you@example.com\n` +
        `  SEED_ADMIN_PASSWORD=<a password you choose>\n` +
        `  SEED_EDITOR_EMAIL=editor@example.com\n` +
        `  SEED_EDITOR_PASSWORD=<a password you choose>\n`,
    )
    process.exit(1)
  }

  return value
}

const ADMIN_EMAIL = required('SEED_ADMIN_EMAIL')
const ADMIN_PASSWORD = required('SEED_ADMIN_PASSWORD')
const EDITOR_EMAIL = required('SEED_EDITOR_EMAIL')
const EDITOR_PASSWORD = required('SEED_EDITOR_PASSWORD')

const seed = async () => {
  const payload = await getPayload({ config })

  payload.logger.info('--- Seeding demonstration content ---')

  // --- accounts -----------------------------------------------------------
  const ensureUser = async (
    email: string,
    password: string,
    name: string,
    roles: ('admin' | 'editor')[],
  ) => {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      payload.logger.info(`user kept: ${email}`)
      return existing.docs[0]
    }

    const created = await payload.create({
      collection: 'users',
      data: { email, password, name, roles },
    })

    payload.logger.info(`user created: ${email} (${roles.join(', ')})`)
    return created
  }

  await ensureUser(ADMIN_EMAIL, ADMIN_PASSWORD, 'Administrateur', ['admin'])
  await ensureUser(EDITOR_EMAIL, EDITOR_PASSWORD, 'Éditeur', ['editor'])

  // --- clear previous sample content --------------------------------------
  for (const collection of [
    'enquiries',
    'albums',
    'projects',
    'team',
    'partners',
    'products',
    'posts',
    'categories',
    'companies',
    'media',
  ] as const) {
    const { docs } = await payload.find({ collection, limit: 500, depth: 0 })
    for (const doc of docs) {
      await payload.delete({ collection, id: doc.id })
    }
    if (docs.length > 0) payload.logger.info(`cleared ${docs.length} x ${collection}`)
  }

  // --- site settings ------------------------------------------------------
  // Placeholder contact details only — nothing here points at the client's
  // real domain, addresses or telephone numbers.
  for (const locale of ['fr', 'en'] as const) {
    await payload.updateGlobal({
      slug: 'site-settings',
      locale,
      data: {
        siteName: 'GROUPE JAOVAZAHA',
        ...content.siteSettings[locale],
        contactEmail: content.siteSettings.contactEmail,
        contactPhone: content.siteSettings.contactPhone,
        social: [],
      },
    })
  }
  payload.logger.info('site settings written (fr + en)')

  // --- categories ---------------------------------------------------------
  const categoryData = [
    { key: 'vanilla', fr: 'Vanille', en: 'Vanilla' },
    { key: 'oils', fr: 'Huiles essentielles', en: 'Essential oils' },
    { key: 'spices', fr: 'Épices', en: 'Spices' },
    { key: 'cocoa', fr: 'Cacao', en: 'Cocoa' },
    { key: 'natural', fr: 'Produits naturels', en: 'Natural products' },
  ]

  const categories: Record<string, number> = {}

  for (const entry of categoryData) {
    const created = await payload.create({
      collection: 'categories',
      locale: 'fr',
      data: { title: entry.fr },
    })

    await payload.update({
      collection: 'categories',
      id: created.id,
      locale: 'en',
      data: { title: entry.en },
    })

    categories[entry.key] = created.id
  }
  payload.logger.info(`categories created: ${categoryData.length} (fr + en)`)

  // --- photographs --------------------------------------------------------
  const uploadImage = async (
    name: string,
    buffer: Buffer,
    alt: { fr: string; en: string },
    ext = 'jpg',
  ): Promise<number> => {
    const media = await payload.create({
      collection: 'media',
      locale: 'fr',
      data: { alt: alt.fr },
      file: {
        data: buffer,
        mimetype: MIME[ext] ?? 'image/jpeg',
        name: `${name}.${ext}`,
        size: buffer.length,
      },
    })

    await payload.update({
      collection: 'media',
      id: media.id,
      locale: 'en',
      data: { alt: alt.en },
    })

    return media.id
  }

  // --- logo ---------------------------------------------------------------
  // src/seed/images/logo.png (or .jpg / .webp). Shared by both languages.
  const logo = findPhoto('logo')

  if (logo) {
    const logoId = await uploadImage(
      'logo',
      logo.buffer,
      { fr: 'Logo GROUPE JAOVAZAHA', en: 'GROUPE JAOVAZAHA logo' },
      logo.ext,
    )

    await payload.updateGlobal({ slug: 'site-settings', data: { logo: logoId } })
    payload.logger.info('logo set in site settings')
  }

  /**
   * Seed photographs are uploaded once and reused: the same vanilla photo can
   * illustrate a product, an album and a news item without three copies in
   * the media library.
   */
  const uploaded = new Map<string, number>()

  const seedImage = async (name: string, alt: { fr: string; en: string }): Promise<number | null> => {
    const known = uploaded.get(name)
    if (known) return known

    const photo = findPhoto(name)
    if (!photo) {
      payload.logger.warn(`missing seed photograph: ${name}`)
      return null
    }

    const id = await uploadImage(name, photo.buffer, alt, photo.ext)
    uploaded.set(name, id)
    return id
  }

  /** Initials on a coloured square, for logos and portraits still to come. */
  const initialsImage = (name: string, initials: string, colour: string, alt: { fr: string; en: string }) =>
    avatarImage(sharp, initials, colour).then((buffer) => uploadImage(name, buffer, alt))

  // --- companies ----------------------------------------------------------
  const companyIds: Record<string, number> = {}

  for (const company of content.companies) {
    const logoId = await initialsImage(`logo-${company.key}`, company.initials, company.colour, {
      fr: `Logo ${company.shortName} (provisoire)`,
      en: `${company.shortName} logo (placeholder)`,
    })
    const coverId = await seedImage(company.cover, company.tagline)

    const created = await payload.create({
      collection: 'companies',
      locale: 'fr',
      data: {
        shortName: company.shortName,
        name: company.name,
        country: company.country.fr,
        tagline: company.tagline.fr,
        summary: company.summary.fr,
        description: richText(company.body.fr),
        keyFacts: company.facts.fr,
        logo: logoId,
        coverImage: coverId,
        legal: {
          legalName: company.name,
          legalForm: content.legalPlaceholders.legalForm.fr,
          registration: content.legalPlaceholders.registration,
          registeredAddress: company.registeredAddress,
        },
        email: company.email,
        phone: company.phone,
        address: company.address.fr,
        slug: company.key,
        order: company.order,
        _status: 'published',
      },
    })

    await payload.update({
      collection: 'companies',
      id: created.id,
      locale: 'en',
      data: {
        country: company.country.en,
        tagline: company.tagline.en,
        summary: company.summary.en,
        description: richText(company.body.en),
        keyFacts: company.facts.en,
        legal: { legalForm: content.legalPlaceholders.legalForm.en },
        address: company.address.en,
        slug: company.key,
        _status: 'published',
      },
    })

    companyIds[company.key] = created.id
    payload.logger.info(`company published: ${company.shortName}`)
  }

  // --- products -----------------------------------------------------------
  const products = [
    {
      slug: 'clous-de-girofle',
      label: 'Girofle',
      colours: ['#43260f', '#8d5a2b'] as [string, string],
      alt: {
        fr: 'Clous de girofle entiers séchés',
        en: 'Whole dried cloves',
      },
      category: 'spices',
      company: 'mfc' as const,
      reference: 'EPI-GIR-007',
      fr: {
        title: 'Clous de girofle entiers',
        shortDescription:
          'Boutons floraux cueillis avant éclosion et séchés au soleil. Chauds et puissants.',
        body: [
          'Le clou de girofle est le bouton floral du giroflier, cueilli à la main juste avant qu’il ne s’ouvre, puis séché au soleil jusqu’à prendre sa couleur brun sombre.',
          'Madagascar en est l’un des premiers producteurs mondiaux. C’est l’eugénol qui lui donne ce parfum chaud et sa légère action anesthésiante.',
          'À utiliser entier dans un bouillon ou un vin chaud, ou moulu dans un mélange d’épices. Comptez-en peu : il couvre vite le reste.',
        ],
        features: [
          { label: 'Espèce', value: 'Syzygium aromaticum' },
          { label: 'Origine', value: 'Côte est, Madagascar' },
          { label: 'Teneur en eugénol', value: '15 à 18 %' },
          { label: 'Conditionnement', value: 'Sachet kraft, 100 g' },
        ],
      },
      en: {
        title: 'Whole Cloves',
        shortDescription:
          'Flower buds picked before they open, then sun dried. Warm and powerful.',
        body: [
          'A clove is the flower bud of the clove tree, picked by hand just before it opens, then dried in the sun until it turns deep brown.',
          'Madagascar is one of the largest producers in the world. Eugenol is what gives cloves their warm scent and their faint numbing effect.',
          'Use them whole in a stock or in mulled wine, or ground in a spice blend. Use few: they cover everything else quickly.',
        ],
        features: [
          { label: 'Species', value: 'Syzygium aromaticum' },
          { label: 'Origin', value: 'East coast, Madagascar' },
          { label: 'Eugenol content', value: '15 to 18%' },
          { label: 'Packaging', value: 'Kraft pouch, 100 g' },
        ],
      },
    },
    {
      slug: 'ylang-ylang',
      label: 'Ylang-Ylang',
      colours: ['#2d2140', '#7a5aa0'] as [string, string],
      alt: {
        fr: 'Flacons ambrés d’huile essentielle',
        en: 'Amber bottles of essential oil',
      },
      category: 'oils',
      company: 'mfc' as const,
      reference: 'EPI-YLA-008',
      fr: {
        title: 'Huile essentielle d’Ylang-Ylang',
        shortDescription:
          'Distillation à la vapeur des fleurs fraîches. Première fraction, qualité « extra ».',
        body: [
          'Les fleurs sont cueillies au petit matin, lorsque leur teneur en huile est la plus élevée, puis distillées dans les heures qui suivent.',
          'La distillation est fractionnée. La première fraction, dite « extra », concentre les notes florales les plus fines ; c’est celle que recherche la parfumerie.',
          'Quelques gouttes suffisent : en diffusion, ou diluée dans une huile végétale pour le massage. À conserver à l’abri de la lumière.',
        ],
        features: [
          { label: 'Espèce', value: 'Cananga odorata' },
          { label: 'Partie distillée', value: 'Fleur fraîche' },
          { label: 'Fraction', value: 'Extra (première)' },
          { label: 'Conditionnement', value: 'Flacon ambré, 10 ml' },
        ],
      },
      en: {
        title: 'Ylang-Ylang Essential Oil',
        shortDescription:
          'Steam distilled from fresh flowers. First fraction, "extra" grade.',
        body: [
          'The flowers are picked at first light, when their oil content is highest, and distilled within hours.',
          'Distillation is fractional. The first fraction, known as "extra", holds the finest floral notes, and is the one perfumery looks for.',
          'A few drops are enough: in a diffuser, or diluted in a carrier oil for massage. Keep it away from light.',
        ],
        features: [
          { label: 'Species', value: 'Cananga odorata' },
          { label: 'Plant part', value: 'Fresh flower' },
          { label: 'Fraction', value: 'Extra (first)' },
          { label: 'Packaging', value: 'Amber bottle, 10 ml' },
        ],
      },
    },
    {
      slug: 'cacao',
      label: 'Cacao',
      colours: ['#3b2114', '#8b5a34'] as [string, string],
      alt: {
        fr: 'Cabosse de cacao et fèves concassées',
        en: 'Cacao pod and cocoa nibs',
      },
      category: 'cocoa',
      company: 'mfc' as const,
      reference: 'EPI-CAC-009',
      fr: {
        title: 'Fèves de cacao torréfiées',
        shortDescription:
          'Cacao du Sambirano, fermenté sept jours puis torréfié doucement.',
        body: [
          'La vallée du Sambirano, au nord-ouest de Madagascar, produit un cacao reconnu pour ses notes d’agrumes et de fruits rouges — rares chez un Trinitario.',
          'Les fèves sont fermentées sept jours en caisses de bois, séchées au soleil, puis torréfiées à basse température pour préserver l’acidité du fruit.',
          'À concasser en éclats pour la pâtisserie, à infuser, ou simplement à grignoter.',
        ],
        features: [
          { label: 'Origine', value: 'Vallée du Sambirano, Madagascar' },
          { label: 'Variété', value: 'Trinitario' },
          { label: 'Fermentation', value: '7 jours' },
          { label: 'Conditionnement', value: 'Sachet kraft, 250 g' },
        ],
      },
      en: {
        title: 'Roasted Cacao Beans',
        shortDescription: 'Sambirano cacao, fermented for seven days then lightly roasted.',
        body: [
          'The Sambirano valley in north-west Madagascar produces a cacao known for its citrus and red-fruit notes — unusual in a Trinitario.',
          'The beans are fermented for seven days in wooden boxes, sun dried, then roasted at low temperature to keep the fruit acidity intact.',
          'Crack them into nibs for baking, steep them, or simply eat them as they are.',
        ],
        features: [
          { label: 'Origin', value: 'Sambirano valley, Madagascar' },
          { label: 'Variety', value: 'Trinitario' },
          { label: 'Fermentation', value: '7 days' },
          { label: 'Packaging', value: 'Kraft pouch, 250 g' },
        ],
      },
    },
    {
      slug: 'vanille-bourbon',
      label: 'Vanille',
      colours: ['#2a1a10', '#6e4a2c'] as [string, string],
      alt: {
        fr: 'Gousses de vanille Bourbon noires et charnues',
        en: 'Plump black Bourbon vanilla pods',
      },
      category: 'vanilla',
      company: 'mfc' as const,
      reference: 'EPI-VAN-010',
      fr: {
        title: 'Vanille Bourbon de Madagascar',
        shortDescription:
          'Gousses noires et souples de la région SAVA, pollinisées une à une à la main.',
        body: [
          'La vanille est le fruit d’une orchidée. Hors de son Mexique d’origine, aucun insecte ne la pollinise : chaque fleur est fécondée à la main, le matin même où elle s’ouvre.',
          'Nos gousses viennent de la région SAVA, au nord-est de Madagascar. Après la récolte, elles sont échaudées, mises à suer en caisses, séchées au soleil puis affinées plusieurs mois. C’est cette préparation lente qui fait naître la vanilline.',
          'Fendez la gousse dans la longueur et grattez les graines dans une crème ou un lait chaud. La gousse vidée parfume encore un bocal de sucre.',
        ],
        features: [
          { label: 'Espèce', value: 'Vanilla planifolia' },
          { label: 'Origine', value: 'Région SAVA, Madagascar' },
          { label: 'Catégorie', value: 'Gourmet, 14 à 16 cm' },
          { label: 'Conditionnement', value: 'Tube verre, 5 gousses' },
        ],
      },
      en: {
        title: 'Madagascar Bourbon Vanilla',
        shortDescription:
          'Supple black pods from the SAVA region, each flower pollinated by hand.',
        body: [
          'Vanilla is the fruit of an orchid. Outside its native Mexico no insect pollinates it, so every flower is fertilised by hand, on the one morning it opens.',
          'Our pods come from the SAVA region in north-east Madagascar. After harvest they are blanched, sweated in boxes, sun dried and then conditioned for several months. That slow curing is what develops the vanillin.',
          'Split the pod lengthways and scrape the seeds into warm cream or milk. The empty pod will still scent a jar of sugar.',
        ],
        features: [
          { label: 'Species', value: 'Vanilla planifolia' },
          { label: 'Origin', value: 'SAVA region, Madagascar' },
          { label: 'Grade', value: 'Gourmet, 14 to 16 cm' },
          { label: 'Packaging', value: 'Glass tube, 5 pods' },
        ],
      },
    },
    {
      slug: 'baies-roses',
      label: 'Baies roses',
      colours: ['#5a1a22', '#c0566a'] as [string, string],
      alt: {
        fr: 'Baies roses séchées',
        en: 'Dried pink peppercorns',
      },
      category: 'spices',
      company: 'mfc' as const,
      reference: 'EPI-BAI-011',
      fr: {
        title: 'Baies roses de Madagascar',
        shortDescription:
          'Petites baies croquantes, douces et légèrement résineuses. Le « faux poivre ».',
        body: [
          'Malgré leur nom de « poivre rose », ces baies ne sont pas un poivre : ce sont les fruits du Schinus terebinthifolius, un arbuste qui pousse le long de la côte est de Madagascar.',
          'Cueillies en grappes à maturité puis séchées, elles gardent une coque fine et cassante. Leur saveur est douce, fruitée, à peine piquante, avec une note de résine.',
          'Écrasez-les entre les doigts plutôt qu’au moulin, et ajoutez-les en fin de cuisson : sur un poisson, un carpaccio ou une salade de fruits. De la même famille que la noix de cajou et la mangue, elles sont à éviter en cas d’allergie à ces fruits.',
        ],
        features: [
          { label: 'Espèce', value: 'Schinus terebinthifolius' },
          { label: 'Origine', value: 'Côte est, Madagascar' },
          { label: 'Usage', value: 'En fin de cuisson' },
          { label: 'Conditionnement', value: 'Bocal verre, 40 g' },
        ],
      },
      en: {
        title: 'Madagascar Pink Peppercorns',
        shortDescription:
          'Small crisp berries, sweet and lightly resinous. The "false pepper".',
        body: [
          'Despite the name, pink peppercorns are not pepper at all. They are the fruit of Schinus terebinthifolius, a shrub that grows along the east coast of Madagascar.',
          'They are picked in clusters when ripe, then dried, leaving a thin brittle shell. The flavour is sweet and fruity, barely hot, with a resinous edge.',
          'Crush them between your fingers rather than in a mill, and add them at the end: over fish, a carpaccio or a fruit salad. They belong to the same family as cashew and mango, so avoid them if you are allergic to either.',
        ],
        features: [
          { label: 'Species', value: 'Schinus terebinthifolius' },
          { label: 'Origin', value: 'East coast, Madagascar' },
          { label: 'Use', value: 'Add at the end' },
          { label: 'Packaging', value: 'Glass jar, 40 g' },
        ],
      },
    },
    {
      slug: 'poivre-noir',
      label: 'Poivre',
      colours: ['#1f1a16', '#5a4a3c'] as [string, string],
      alt: {
        fr: 'Grains de poivre noir',
        en: 'Black peppercorns',
      },
      category: 'spices',
      company: 'mfc' as const,
      reference: 'EPI-POI-012',
      fr: {
        title: 'Poivre noir de Madagascar',
        shortDescription:
          'Grains entiers séchés au soleil. Parfum boisé, piquant net sans être brûlant.',
        body: [
          'Le poivre noir est le fruit du poivrier, Piper nigrum, une liane qui grimpe le long d’un tuteur. Les grappes sont cueillies encore vertes, puis séchées au soleil : en quelques jours, la peau fonce et se ride jusqu’à donner ce grain noir que l’on connaît.',
          'Le poivre de Madagascar est apprécié pour son parfum boisé, légèrement fruité. Son piquant est franc, sans être brûlant.',
          'Gardez-le en grains et moulez-le au dernier moment : moulu, il perd vite son parfum. Ajoutez-le de préférence en fin de cuisson.',
        ],
        features: [
          { label: 'Espèce', value: 'Piper nigrum' },
          { label: 'Origine', value: 'Madagascar' },
          { label: 'Forme', value: 'Grains entiers' },
          { label: 'Conditionnement', value: 'Bocal verre, 80 g' },
        ],
      },
      en: {
        title: 'Madagascar Black Pepper',
        shortDescription:
          'Whole sun-dried peppercorns. Woody scent, a clean heat that never burns.',
        body: [
          'Black pepper is the fruit of Piper nigrum, a vine that climbs a support tree. The clusters are picked while still green, then dried in the sun: within a few days the skin darkens and wrinkles into the familiar black peppercorn.',
          'Madagascar pepper is prized for its woody, slightly fruity scent. Its heat is clean and direct without burning.',
          'Keep it whole and grind it at the last moment: ground pepper loses its scent quickly. Add it towards the end of cooking.',
        ],
        features: [
          { label: 'Species', value: 'Piper nigrum' },
          { label: 'Origin', value: 'Madagascar' },
          { label: 'Form', value: 'Whole peppercorns' },
          { label: 'Packaging', value: 'Glass jar, 80 g' },
        ],
      },
    },
    {
      slug: 'curcuma',
      label: 'Curcuma',
      colours: ['#8a4f06', '#e0a020'] as [string, string],
      alt: {
        fr: 'Curcuma moulu et racines de curcuma',
        en: 'Ground turmeric and turmeric roots',
      },
      category: 'spices',
      company: 'eac' as const,
      reference: 'EPI-CUR-013',
      fr: {
        title: 'Curcuma moulu de Madagascar',
        shortDescription:
          'Racines bouillies, séchées au soleil puis moulues. Couleur intense, saveur terreuse.',
        body: [
          'Le curcuma, Curcuma longa, est un rhizome de la même famille que le gingembre. Après la récolte, les racines sont bouillies, séchées au soleil puis moulues en une poudre d’un jaune orangé profond.',
          'Sa saveur est douce, terreuse et légèrement amère. C’est la curcumine qui lui donne sa couleur — et qui tache : attention aux plans de travail et aux tissus.',
          'Il accompagne le riz, les lentilles, les currys ou un lait chaud. Une pincée de poivre noir à ses côtés est une association classique.',
        ],
        features: [
          { label: 'Espèce', value: 'Curcuma longa' },
          { label: 'Origine', value: 'Madagascar' },
          { label: 'Mouture', value: 'Fine' },
          { label: 'Conditionnement', value: 'Bocal verre, 70 g' },
        ],
      },
      en: {
        title: 'Madagascar Ground Turmeric',
        shortDescription:
          'Roots boiled, sun dried and then ground. Deep colour, earthy flavour.',
        body: [
          'Turmeric, Curcuma longa, is a rhizome from the same family as ginger. After harvest the roots are boiled, dried in the sun and ground into a deep orange-yellow powder.',
          'The flavour is mild, earthy and slightly bitter. Curcumin gives it its colour — and it stains, so mind your worktops and fabrics.',
          'It goes with rice, lentils, curries or warm milk. A pinch of black pepper alongside is a classic pairing.',
        ],
        features: [
          { label: 'Species', value: 'Curcuma longa' },
          { label: 'Origin', value: 'Madagascar' },
          { label: 'Grind', value: 'Fine' },
          { label: 'Packaging', value: 'Glass jar, 70 g' },
        ],
      },
    },
    {
      slug: 'gingembre',
      label: 'Gingembre',
      colours: ['#7a5a2e', '#d2b07a'] as [string, string],
      alt: {
        fr: 'Racines de gingembre et gingembre moulu',
        en: 'Ginger roots and ground ginger',
      },
      category: 'spices',
      company: 'eac' as const,
      reference: 'EPI-GIN-014',
      fr: {
        title: 'Gingembre moulu de Madagascar',
        shortDescription:
          'Rhizome séché puis moulu. Chaud et citronné, en pâtisserie comme en cuisine.',
        body: [
          'Le gingembre, Zingiber officinale, se récolte quand ses tiges commencent à jaunir. Les rhizomes sont lavés, tranchés, séchés puis moulus.',
          'Séché, il perd un peu de la fraîcheur du gingembre frais mais gagne en chaleur : son piquant est plus profond, avec une note citronnée.',
          'Une demi-cuillère à café suffit pour un gâteau, une compote ou un bouillon. Il s’accorde très bien avec le clou de girofle et la vanille.',
        ],
        features: [
          { label: 'Espèce', value: 'Zingiber officinale' },
          { label: 'Origine', value: 'Madagascar' },
          { label: 'Mouture', value: 'Fine' },
          { label: 'Conditionnement', value: 'Bocal verre, 60 g' },
        ],
      },
      en: {
        title: 'Madagascar Ground Ginger',
        shortDescription:
          'Dried and ground rhizome. Warm and lemony, for baking and cooking alike.',
        body: [
          'Ginger, Zingiber officinale, is harvested when its stems start to turn yellow. The rhizomes are washed, sliced, dried and ground.',
          'Drying takes away some of fresh ginger’s brightness but adds warmth: the heat runs deeper, with a lemony note.',
          'Half a teaspoon is enough for a cake, a compote or a stock. It pairs very well with cloves and vanilla.',
        ],
        features: [
          { label: 'Species', value: 'Zingiber officinale' },
          { label: 'Origin', value: 'Madagascar' },
          { label: 'Grind', value: 'Fine' },
          { label: 'Packaging', value: 'Glass jar, 60 g' },
        ],
      },
    },
    {
      slug: 'miel-litchi',
      label: 'Miel',
      colours: ['#8a5a1c', '#e0b062'] as [string, string],
      alt: {
        fr: 'Pot de miel ambré et cuillère à miel en bois',
        en: 'Jar of amber honey with a wooden dipper',
      },
      category: 'natural',
      company: 'eac' as const,
      reference: 'EPI-MIE-015',
      fr: {
        title: 'Miel de litchi de Madagascar',
        shortDescription:
          'Récolté pendant la floraison des litchis, sur la côte est. Doux, floral, ambre clair.',
        body: [
          'La région de Toamasina, sur la côte est de Madagascar, est le pays du litchi. Pendant la courte floraison des arbres, quelques mois avant la saison des fruits, les abeilles en butinent les petites fleurs.',
          'Ce miel est clair et doux, avec un parfum floral délicat. Comme la plupart des miels non chauffés, il finit par cristalliser : quelques minutes au bain-marie tiède le rendent de nouveau liquide.',
          'Sur une tartine, dans un yaourt ou un thé. Évitez de le chauffer fort, il y perdrait son parfum. Ne convient pas aux enfants de moins d’un an.',
        ],
        features: [
          { label: 'Fleur', value: 'Litchi' },
          { label: 'Origine', value: 'Région de Toamasina, Madagascar' },
          { label: 'Texture', value: 'Liquide, cristallise avec le temps' },
          { label: 'Conditionnement', value: 'Pot verre, 250 g' },
        ],
      },
      en: {
        title: 'Madagascar Litchi Honey',
        shortDescription:
          'Gathered while the litchi trees flower on the east coast. Mild, floral, pale amber.',
        body: [
          'The Toamasina region on Madagascar’s east coast is litchi country. During the trees’ short flowering, a few months before the fruit season, the bees forage on their small blossoms.',
          'This honey is pale and mild, with a delicate floral scent. Like most unheated honeys it eventually crystallises; a few minutes in a warm water bath makes it runny again.',
          'On toast, in yoghurt or in tea. Avoid heating it hard, which takes away its scent. Not suitable for children under one year old.',
        ],
        features: [
          { label: 'Flower', value: 'Litchi' },
          { label: 'Origin', value: 'Toamasina region, Madagascar' },
          { label: 'Texture', value: 'Runny, crystallises over time' },
          { label: 'Packaging', value: 'Glass jar, 250 g' },
        ],
      },
    },
    {
      slug: 'noix-de-cajou',
      label: 'Cajou',
      colours: ['#8a6a3a', '#e8d2a6'] as [string, string],
      alt: {
        fr: 'Noix de cajou décortiquées',
        en: 'Shelled cashew nuts',
      },
      category: 'natural',
      company: 'eac' as const,
      reference: 'EPI-CAJ-016',
      fr: {
        title: 'Noix de cajou de Madagascar',
        shortDescription:
          'Noix entières, décortiquées une à une, non salées. Tendres et légèrement sucrées.',
        body: [
          'La noix de cajou pousse sous un fruit étonnant, la pomme de cajou. L’anacardier, Anacardium occidentale, est cultivé dans le nord-ouest de Madagascar.',
          'Sa coque renferme une résine irritante : les noix sont chauffées, décortiquées une à une, puis séchées et triées. Nous les gardons entières et sans sel.',
          'À grignoter telles quelles, à dorer quelques minutes à la poêle ou à mixer dans une sauce. Fruits à coque : à éviter en cas d’allergie.',
        ],
        features: [
          { label: 'Espèce', value: 'Anacardium occidentale' },
          { label: 'Origine', value: 'Nord-ouest, Madagascar' },
          { label: 'Préparation', value: 'Décortiquées, non salées' },
          { label: 'Conditionnement', value: 'Sachet kraft, 200 g' },
        ],
      },
      en: {
        title: 'Madagascar Cashew Nuts',
        shortDescription:
          'Whole nuts, shelled one by one and unsalted. Tender and lightly sweet.',
        body: [
          'The cashew nut grows beneath a surprising fruit, the cashew apple. The cashew tree, Anacardium occidentale, is grown in north-west Madagascar.',
          'Its shell holds an irritant resin, so the nuts are heated and shelled one by one, then dried and sorted. We keep them whole and unsalted.',
          'Eat them as they are, toast them for a few minutes in a dry pan, or blend them into a sauce. Tree nuts: avoid them if you have a nut allergy.',
        ],
        features: [
          { label: 'Species', value: 'Anacardium occidentale' },
          { label: 'Origin', value: 'North-west Madagascar' },
          { label: 'Preparation', value: 'Shelled, unsalted' },
          { label: 'Packaging', value: 'Kraft pouch, 200 g' },
        ],
      },
    },
  ]

  const productIds: Record<string, number> = {}

  for (const product of products) {
    const photo = realPhoto(product.slug)
    const extras = extraPhotos(product.slug)

    if (photo) {
      const extraNote = extras.length > 0 ? ` (+${extras.length} in the gallery)` : ''
      payload.logger.info(`using real photograph for ${product.slug}${extraNote}`)
    }

    const imageId = await uploadImage(
      product.slug,
      photo?.buffer ?? (await placeholderImage(sharp, product.label, product.colours)),
      product.alt,
      photo?.ext ?? 'jpg',
    )
    if (photo) uploaded.set(product.slug, imageId)

    const galleryIds: number[] = []

    for (const extra of extras) {
      const extraId = await uploadImage(`${product.slug}-${extra.index}`, extra.buffer, product.alt, extra.ext)
      uploaded.set(`${product.slug}-${extra.index}`, extraId)
      galleryIds.push(extraId)
    }

    const created = await payload.create({
      collection: 'products',
      locale: 'fr',
      data: {
        title: product.fr.title,
        shortDescription: product.fr.shortDescription,
        description: richText(product.fr.body),
        features: product.fr.features,
        image: imageId,
        gallery: galleryIds,
        category: categories[product.category],
        company: companyIds[product.company],
        reference: product.reference,
        // One example of the optional link to EAC's future online store, so
        // the button can be shown. The .example domain is reserved and goes
        // nowhere.
        shopUrl:
          product.slug === 'vanille-bourbon'
            ? 'https://boutique-eac.example/products/vanille-bourbon'
            : undefined,
        _status: 'published',
        publishedAt: new Date().toISOString(),
      },
    })

    productIds[product.slug] = created.id

    await payload.update({
      collection: 'products',
      id: created.id,
      locale: 'en',
      data: {
        title: product.en.title,
        shortDescription: product.en.shortDescription,
        description: richText(product.en.body),
        features: product.en.features,
        _status: 'published',
      },
    })

    payload.logger.info(`product published: ${product.fr.title} / ${product.en.title}`)
  }

  // --- founder and management ---------------------------------------------
  for (const member of content.team) {
    const photoId = await initialsImage(`portrait-${member.initials.toLowerCase()}-${member.order}`, member.initials, member.colour, {
      fr: `Portrait provisoire — ${member.name}`,
      en: `Placeholder portrait — ${member.name}`,
    })

    const created = await payload.create({
      collection: 'team',
      locale: 'fr',
      data: {
        name: member.name,
        role: member.role.fr,
        bio: member.bio.fr,
        company: member.company ? companyIds[member.company] : null,
        photo: photoId,
        isFounder: Boolean(member.founder),
        order: member.order,
      },
    })

    await payload.update({
      collection: 'team',
      id: created.id,
      locale: 'en',
      data: { role: member.role.en, bio: member.bio.en },
    })
  }
  payload.logger.info(`team created: ${content.team.length} (founder is a placeholder)`)

  // --- projects -----------------------------------------------------------
  for (const project of content.projects) {
    const coverId = await seedImage(project.cover, { fr: project.fr.title, en: project.en.title })
    if (!coverId) continue

    const created = await payload.create({
      collection: 'projects',
      locale: 'fr',
      data: {
        title: project.fr.title,
        summary: project.fr.summary,
        description: richText(project.fr.body),
        location: project.fr.location,
        period: project.fr.period,
        coverImage: coverId,
        status: project.status,
        company: project.company ? companyIds[project.company] : null,
        order: project.order,
        _status: 'published',
      },
    })

    await payload.update({
      collection: 'projects',
      id: created.id,
      locale: 'en',
      data: {
        title: project.en.title,
        summary: project.en.summary,
        description: richText(project.en.body),
        location: project.en.location,
        period: project.en.period,
        _status: 'published',
      },
    })
  }
  payload.logger.info(`projects published: ${content.projects.length}`)

  // --- partners -----------------------------------------------------------
  for (const partner of content.partners) {
    const logoId = await initialsImage(`partner-${partner.initials.toLowerCase()}`, partner.initials, partner.colour, {
      fr: `Logo provisoire — ${partner.name}`,
      en: `Placeholder logo — ${partner.name}`,
    })

    const created = await payload.create({
      collection: 'partners',
      locale: 'fr',
      data: {
        name: partner.name,
        type: partner.type,
        country: partner.country.fr,
        description: partner.description.fr,
        logo: logoId,
        order: partner.order,
      },
    })

    await payload.update({
      collection: 'partners',
      id: created.id,
      locale: 'en',
      data: { country: partner.country.en, description: partner.description.en },
    })
  }
  payload.logger.info(`partners created: ${content.partners.length} (all fictional)`)

  // --- news ---------------------------------------------------------------
  for (const item of content.news) {
    const coverId = await seedImage(item.cover, item.coverAlt)
    if (!coverId) continue

    const avatarId = await initialsImage(`author-${item.slug}`, content.NEWS_AUTHOR.initials, content.NEWS_AUTHOR.colour, {
      fr: content.NEWS_AUTHOR.name,
      en: content.NEWS_AUTHOR.name,
    })

    const publishedAt = new Date(Date.now() - item.daysAgo * 24 * 60 * 60 * 1000).toISOString()

    const created = await payload.create({
      collection: 'posts',
      locale: 'fr',
      data: {
        title: item.fr.title,
        excerpt: item.fr.excerpt,
        content: richText(item.fr.body),
        coverImage: coverId,
        authorName: content.NEWS_AUTHOR.name,
        authorAvatar: avatarId,
        _status: 'published',
        publishedAt,
      },
    })

    await payload.update({
      collection: 'posts',
      id: created.id,
      locale: 'en',
      data: {
        title: item.en.title,
        excerpt: item.en.excerpt,
        content: richText(item.en.body),
        _status: 'published',
      },
    })

    payload.logger.info(`news published: ${item.fr.title}`)
  }

  // --- gallery ------------------------------------------------------------
  for (const album of content.albums) {
    const photoIds: number[] = []
    for (const name of album.photos) {
      const id = await seedImage(name, album.title)
      if (id) photoIds.push(id)
    }

    const created = await payload.create({
      collection: 'albums',
      locale: 'fr',
      data: {
        title: album.title.fr,
        description: album.description.fr,
        photos: photoIds,
        date: album.date,
        order: album.order,
      },
    })

    await payload.update({
      collection: 'albums',
      id: created.id,
      locale: 'en',
      data: { title: album.title.en, description: album.description.en },
    })
  }
  payload.logger.info(`gallery albums created: ${content.albums.length}`)

  // --- page texts -----------------------------------------------------------
  const heroImage = await seedImage(content.homePage.heroImage, {
    fr: 'Gousses de vanille de Madagascar',
    en: 'Madagascar vanilla pods',
  })
  const aboutImage = await seedImage(content.aboutPage.image, {
    fr: 'Épices de Madagascar',
    en: 'Spices from Madagascar',
  })

  for (const locale of ['fr', 'en'] as const) {
    await payload.updateGlobal({
      slug: 'home-page',
      locale,
      data: {
        hero: { ...content.homePage[locale].hero, image: heroImage },
        structure: content.homePage[locale].structure,
        closing: content.homePage[locale].closing,
        featuredProducts: content.homePage.featured
          .map((slug) => productIds[slug])
          .filter((id): id is number => Boolean(id)),
      },
    })

    await payload.updateGlobal({
      slug: 'about-page',
      locale,
      data: {
        title: content.aboutPage[locale].title,
        intro: content.aboutPage[locale].intro,
        content: richText(content.aboutPage[locale].body),
        image: aboutImage,
        values: content.aboutPage[locale].values,
      },
    })

    const legal = content.legalPages[locale]
    await payload.updateGlobal({
      slug: 'legal-pages',
      locale,
      data: {
        legalNotice: { title: legal.legalNotice.title, content: richText(legal.legalNotice.body) },
        privacy: { title: legal.privacy.title, content: richText(legal.privacy.body) },
      },
    })

    await payload.updateGlobal({
      slug: 'section-intros',
      locale,
      data: content.sectionIntros[locale],
    })
  }
  payload.logger.info('page texts written: home, about, legal, section introductions (fr + en)')

  // --- sample enquiries -------------------------------------------------------
  // So the "Enquiries" list in the administration area shows what arrives.
  for (const enquiry of content.enquiries) {
    await payload.create({
      collection: 'enquiries',
      data: {
        type: enquiry.type,
        product: enquiry.product ? productIds[enquiry.product] : undefined,
        name: enquiry.name,
        company: enquiry.company,
        email: enquiry.email,
        country: enquiry.country,
        volume: enquiry.volume || undefined,
        message: enquiry.message,
        language: enquiry.language,
        status: enquiry.status,
        notes: 'notes' in enquiry ? enquiry.notes : undefined,
        consentAt: new Date(Date.now() - enquiry.daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - enquiry.daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      },
    })
  }
  payload.logger.info(`sample enquiries created: ${content.enquiries.length}`)

  payload.logger.info('--- Done ---')
  payload.logger.info(
    `Admin panel:  ${process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'}/admin`,
  )
  payload.logger.info(`Administrator: ${ADMIN_EMAIL}`)
  payload.logger.info(`Editor:        ${EDITOR_EMAIL}`)
  payload.logger.info('Passwords are the SEED_* values in .env.')
  payload.logger.info('Change them before sharing the link with anyone outside the project.')
}

await seed()
process.exit(0)
