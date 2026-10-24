/**
 * Fills the demonstration database with sample content.
 *
 *   npm run seed
 *
 * Safe to run repeatedly: it clears products, categories, articles and
 * photographs first, then recreates them. User accounts and newsletter
 * sign-ups are kept.
 *
 * Everything here is fictional sample content, as agreed for the demonstration.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '@payload-config'
import sharp from 'sharp'

import { richText } from './richText'
import { placeholderImage, avatarImage } from './placeholderImage'

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
  for (const collection of ['products', 'posts', 'categories', 'media'] as const) {
    const { docs } = await payload.find({ collection, limit: 500, depth: 0 })
    for (const doc of docs) {
      await payload.delete({ collection, id: doc.id })
    }
    if (docs.length > 0) payload.logger.info(`cleared ${docs.length} x ${collection}`)
  }

  // --- site settings ------------------------------------------------------
  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'fr',
    data: {
      siteName: 'Cannelle',
      tagline: 'Cannelle de Ceylan et de Cassia',
      newsletterHeading:
        'Inscrivez-vous à la lettre d’information\net recevez nos nouveautés',
      contactEmail: 'contact@demo.local',
      contactPhone: '+33 7 83 74 69 83',
      address: 'Antananarivo, Madagascar\nBureau commercial — France',
    },
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'en',
    data: {
      siteName: 'Cannelle',
      tagline: 'Ceylon and Cassia cinnamon',
      newsletterHeading: 'Subscribe to the newsletter\nand stay up to date',
      contactEmail: 'contact@demo.local',
      contactPhone: '+33 7 83 74 69 83',
      address: 'Antananarivo, Madagascar\nSales office — France',
    },
  })
  payload.logger.info('site settings written (fr + en)')

  // --- categories ---------------------------------------------------------
  const categoryData = [
    { key: 'sticks', fr: 'Bâtons', en: 'Sticks' },
    { key: 'ground', fr: 'Moulue', en: 'Ground' },
    { key: 'blends', fr: 'Mélanges', en: 'Blends' },
    { key: 'gifts', fr: 'Coffrets', en: 'Gift sets' },
    { key: 'other', fr: 'Autres épices', en: 'Other spices' },
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

  // --- products -----------------------------------------------------------
  const products = [
    {
      slug: 'ceylan-batons',
      label: 'Ceylan',
      colours: ['#6b3a16', '#c68a4a'] as [string, string],
      alt: {
        fr: 'Bâtons de cannelle de Ceylan enroulés',
        en: 'Rolled Ceylon cinnamon quills',
      },
      category: 'sticks',
      reference: 'CAN-CEY-001',
      price: 18,
      fr: {
        title: 'Cannelle de Ceylan — bâtons',
        shortDescription:
          'Fins bâtons clairs, roulés à la main. La « vraie » cannelle, douce et florale.',
        body: [
          'La cannelle de Ceylan provient de l’écorce intérieure du Cinnamomum verum. Elle est pelée à la main puis roulée en fins bâtons qui se brisent facilement entre les doigts.',
          'Son parfum est doux, floral et légèrement sucré, bien moins piquant que celui de la Cassia. C’est la cannelle des pâtisseries et des infusions.',
        ],
        features: [
          { label: 'Espèce', value: 'Cinnamomum verum' },
          { label: 'Longueur', value: '8 cm' },
          { label: 'Coumarine', value: 'Traces' },
          { label: 'Conditionnement', value: 'Sachet kraft, 100 g' },
        ],
      },
      en: {
        title: 'Ceylon Cinnamon — Quills',
        shortDescription:
          'Thin pale quills, hand rolled. The "true" cinnamon, soft and floral.',
        body: [
          'Ceylon cinnamon comes from the inner bark of Cinnamomum verum. It is peeled by hand and rolled into thin quills that crumble easily between your fingers.',
          'Its scent is soft, floral and gently sweet, far less fiery than Cassia. This is the cinnamon for baking and infusions.',
        ],
        features: [
          { label: 'Species', value: 'Cinnamomum verum' },
          { label: 'Length', value: '8 cm' },
          { label: 'Coumarin', value: 'Trace amounts' },
          { label: 'Packaging', value: 'Kraft pouch, 100 g' },
        ],
      },
    },
    {
      slug: 'ceylan-moulue',
      label: 'Moulue',
      colours: ['#7a4418', '#d09a5c'] as [string, string],
      alt: {
        fr: 'Cannelle de Ceylan moulue dans un bol',
        en: 'Ground Ceylon cinnamon in a bowl',
      },
      category: 'ground',
      reference: 'CAN-CEY-002',
      price: 12,
      fr: {
        title: 'Cannelle de Ceylan moulue',
        shortDescription: 'Moulue finement à la commande, dans un bocal hermétique.',
        body: [
          'Les mêmes bâtons de Ceylan, moulus finement. Nous moulons par petits lots, car la cannelle moulue perd son parfum en quelques mois.',
          'À saupoudrer sur un porridge, un café, des pommes au four, ou à incorporer dans une pâte à gâteau.',
        ],
        features: [
          { label: 'Espèce', value: 'Cinnamomum verum' },
          { label: 'Mouture', value: 'Fine' },
          { label: 'À consommer', value: 'Dans les 12 mois' },
          { label: 'Conditionnement', value: 'Bocal verre, 60 g' },
        ],
      },
      en: {
        title: 'Ground Ceylon Cinnamon',
        shortDescription: 'Finely ground to order, in an airtight jar.',
        body: [
          'The same Ceylon quills, finely ground. We mill in small batches, because ground cinnamon loses its scent within months.',
          'Dust it over porridge, coffee or baked apples, or fold it into a cake batter.',
        ],
        features: [
          { label: 'Species', value: 'Cinnamomum verum' },
          { label: 'Grind', value: 'Fine' },
          { label: 'Best within', value: '12 months' },
          { label: 'Packaging', value: 'Glass jar, 60 g' },
        ],
      },
    },
    {
      slug: 'cassia-batons',
      label: 'Cassia',
      colours: ['#4f2410', '#a35f28'] as [string, string],
      alt: {
        fr: 'Bâtons épais de cannelle Cassia',
        en: 'Thick Cassia cinnamon sticks',
      },
      category: 'sticks',
      reference: 'CAN-CAS-003',
      price: 9,
      fr: {
        title: 'Cannelle Cassia — bâtons',
        shortDescription: 'Écorce épaisse et sombre, parfum puissant. Pour les plats mijotés.',
        body: [
          'La Cassia est plus robuste que la Ceylan : écorce épaisse, couleur rouge sombre, arôme franchement épicé.',
          'C’est elle que l’on glisse dans un curry, un tajine ou un vin chaud, où elle tient la cuisson sans disparaître.',
        ],
        features: [
          { label: 'Espèce', value: 'Cinnamomum cassia' },
          { label: 'Longueur', value: '10 cm' },
          { label: 'Usage', value: 'Cuisson longue' },
          { label: 'Conditionnement', value: 'Sachet kraft, 150 g' },
        ],
      },
      en: {
        title: 'Cassia Cinnamon — Sticks',
        shortDescription: 'Thick dark bark, powerful scent. For slow cooking.',
        body: [
          'Cassia is the sturdier cousin of Ceylon: thick bark, deep red-brown colour, frankly spicy aroma.',
          'This is the one to drop into a curry, a tagine or mulled wine, where it holds up through long cooking.',
        ],
        features: [
          { label: 'Species', value: 'Cinnamomum cassia' },
          { label: 'Length', value: '10 cm' },
          { label: 'Use', value: 'Slow cooking' },
          { label: 'Packaging', value: 'Kraft pouch, 150 g' },
        ],
      },
    },
    {
      slug: 'melange-chai',
      label: 'Chaï',
      colours: ['#5c3a1e', '#b98048'] as [string, string],
      alt: {
        fr: 'Mélange chaï à la cannelle, cardamome et gingembre',
        en: 'Cinnamon chai blend with cardamom and ginger',
      },
      category: 'blends',
      reference: 'CAN-MEL-004',
      price: 15,
      fr: {
        title: 'Mélange chaï à la cannelle',
        shortDescription: 'Cannelle, cardamome, gingembre, clou de girofle et poivre noir.',
        body: [
          'Notre mélange chaï est construit autour de la Cassia, assez puissante pour tenir tête au lait et au thé noir.',
          'Comptez une cuillère à café par tasse, à faire frémir dix minutes dans un mélange moitié lait moitié eau.',
        ],
        features: [
          { label: 'Base', value: 'Cannelle Cassia' },
          { label: 'Contient', value: 'Cardamome, gingembre, girofle, poivre' },
          { label: 'Préparation', value: '10 min à frémissement' },
          { label: 'Conditionnement', value: 'Bocal verre, 120 g' },
        ],
      },
      en: {
        title: 'Cinnamon Chai Blend',
        shortDescription: 'Cinnamon, cardamom, ginger, clove and black pepper.',
        body: [
          'Our chai blend is built around Cassia, strong enough to stand up to milk and black tea.',
          'Use a teaspoon per cup, simmered for ten minutes in half milk, half water.',
        ],
        features: [
          { label: 'Base', value: 'Cassia cinnamon' },
          { label: 'Contains', value: 'Cardamom, ginger, clove, pepper' },
          { label: 'Preparation', value: '10 min simmer' },
          { label: 'Packaging', value: 'Glass jar, 120 g' },
        ],
      },
    },
    {
      slug: 'miel-cannelle',
      label: 'Miel',
      colours: ['#8a5a1c', '#e0b062'] as [string, string],
      alt: {
        fr: 'Pot de miel infusé à la cannelle',
        en: 'Jar of cinnamon-infused honey',
      },
      category: 'blends',
      reference: 'CAN-MIE-005',
      price: 22,
      fr: {
        title: 'Miel infusé à la cannelle',
        shortDescription: 'Miel de fleurs infusé six semaines avec des bâtons de Ceylan.',
        body: [
          'Un miel de fleurs doux, dans lequel reposent des bâtons de Ceylan pendant six semaines.',
          'Sur une tartine, dans un yaourt, ou simplement à la cuillère quand la gorge gratte.',
        ],
        features: [
          { label: 'Miel', value: 'Toutes fleurs' },
          { label: 'Infusion', value: '6 semaines' },
          { label: 'Cannelle', value: 'Ceylan' },
          { label: 'Conditionnement', value: 'Pot verre, 250 g' },
        ],
      },
      en: {
        title: 'Cinnamon-Infused Honey',
        shortDescription: 'Wildflower honey, infused for six weeks with Ceylon quills.',
        body: [
          'A gentle wildflower honey, with Ceylon quills left to steep in it for six weeks.',
          'On toast, stirred into yoghurt, or straight off the spoon when your throat is scratchy.',
        ],
        features: [
          { label: 'Honey', value: 'Wildflower' },
          { label: 'Infusion', value: '6 weeks' },
          { label: 'Cinnamon', value: 'Ceylon' },
          { label: 'Packaging', value: 'Glass jar, 250 g' },
        ],
      },
    },
    {
      slug: 'coffret-decouverte',
      label: 'Coffret',
      colours: ['#3d2512', '#8c6236'] as [string, string],
      alt: {
        fr: 'Coffret découverte de cannelles',
        en: 'Cinnamon discovery gift box',
      },
      category: 'gifts',
      reference: 'CAN-COF-006',
      price: 45,
      fr: {
        title: 'Coffret découverte',
        shortDescription: 'Les quatre cannelles, en petits formats, dans une boîte en bois.',
        body: [
          'Le coffret réunit Ceylan en bâtons, Ceylan moulue, Cassia en bâtons et le mélange chaï.',
          'Une fiche explique l’origine de chacune et comment les distinguer à l’œil et au nez.',
        ],
        features: [
          { label: 'Contient', value: '4 références' },
          { label: 'Boîte', value: 'Bois, réutilisable' },
          { label: 'Fiche', value: 'Français et anglais' },
          { label: 'Poids total', value: '320 g' },
        ],
      },
      en: {
        title: 'Discovery Gift Box',
        shortDescription: 'All four cinnamons, in small formats, in a wooden box.',
        body: [
          'The box brings together Ceylon quills, ground Ceylon, Cassia sticks and the chai blend.',
          'A card explains where each one comes from and how to tell them apart by eye and by nose.',
        ],
        features: [
          { label: 'Contains', value: '4 products' },
          { label: 'Box', value: 'Wood, reusable' },
          { label: 'Card', value: 'French and English' },
          { label: 'Total weight', value: '320 g' },
        ],
      },
    },
    {
      slug: 'clous-de-girofle',
      label: 'Girofle',
      colours: ['#43260f', '#8d5a2b'] as [string, string],
      alt: {
        fr: 'Clous de girofle entiers séchés',
        en: 'Whole dried cloves',
      },
      category: 'other',
      reference: 'EPI-GIR-007',
      price: 14,
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
      category: 'other',
      reference: 'EPI-YLA-008',
      price: 28,
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
      category: 'other',
      reference: 'EPI-CAC-009',
      price: 16,
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
  ]

  for (const product of products) {
    {
      slug: 'vanille-bourbon',
      label: 'Vanille',
      colours: ['#2a1a10', '#6e4a2c'] as [string, string],
      alt: {
        fr: 'Gousses de vanille Bourbon noires et charnues',
        en: 'Plump black Bourbon vanilla pods',
      },
      category: 'other',
      reference: 'EPI-VAN-010',
      price: 24,
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
      category: 'other',
      reference: 'EPI-BAI-011',
      price: 11,
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

    const galleryIds: number[] = []

    for (const extra of extras) {
      galleryIds.push(
        await uploadImage(`${product.slug}-${extra.index}`, extra.buffer, product.alt, extra.ext),
      )
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
        reference: product.reference,
        price: product.price,
        currency: 'EUR',
        inStock: true,
        _status: 'published',
        publishedAt: new Date().toISOString(),
      },
    })

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

  // --- journal ------------------------------------------------------------
  const posts = [
    {
      slug: 'ceylan-cassia',
      label: 'Journal',
      colours: ['#5e3418', '#bf8347'] as [string, string],
      alt: {
        fr: 'Bâtons de Ceylan et de Cassia côte à côte',
        en: 'Ceylon and Cassia sticks side by side',
      },
      author: { name: 'Hanta Rakoto', initials: 'HR', colour: '#7a4418' },
      daysAgo: 4,
      fr: {
        title: 'Ceylan ou Cassia : comment les distinguer',
        excerpt:
          'Les deux sont vendues sous le nom de cannelle, mais elles ne se ressemblent ni à l’œil, ni au nez, ni en cuisine.',
        body: [
          'Posez un bâton de chaque côte à côte et la différence saute aux yeux. La Ceylan est claire, fine, composée de plusieurs couches d’écorce enroulées comme un cigare. La Cassia est sombre, épaisse, et se referme sur elle-même en un seul rouleau creux.',
          'Au nez, la Ceylan est florale et presque sucrée. La Cassia est plus directe, plus piquante, avec une pointe de chaleur qui reste en bouche.',
          'En cuisine, la règle est simple : la Ceylan pour tout ce qui est délicat, pâtisserie et infusion ; la Cassia pour ce qui mijote longtemps et doit tenir.',
          'Un dernier point, moins connu : la Cassia contient de la coumarine, que l’on déconseille en grande quantité. Pour un usage quotidien, la Ceylan reste le choix le plus sûr.',
        ],
      },
      en: {
        title: 'Ceylon or Cassia: how to tell them apart',
        excerpt:
          'Both are sold as cinnamon, but they do not look, smell or cook the same way at all.',
        body: [
          'Put a stick of each side by side and the difference is obvious. Ceylon is pale and thin, made of several layers of bark rolled up like a cigar. Cassia is dark and thick, curling in on itself as a single hollow roll.',
          'By nose, Ceylon is floral and almost sweet. Cassia is more direct, spicier, with a warmth that lingers.',
          'In the kitchen the rule is simple: Ceylon for anything delicate, baking and infusions; Cassia for things that simmer a long time and need to hold up.',
          'One last point, less widely known: Cassia contains coumarin, which is not recommended in large amounts. For everyday use, Ceylon remains the safer choice.',
        ],
      },
    },
    {
      slug: 'trois-facons',
      label: 'Cuisine',
      colours: ['#6f4a20', '#d2a368'] as [string, string],
      alt: {
        fr: 'Pommes au four à la cannelle',
        en: 'Baked apples with cinnamon',
      },
      author: { name: 'Léa Marchand', initials: 'LM', colour: '#5c3a1e' },
      daysAgo: 11,
      fr: {
        title: 'Trois façons d’utiliser la cannelle en cuisine',
        excerpt:
          'Au-delà du gâteau aux pommes : trois usages simples qui changent un plat du quotidien.',
        body: [
          'Dans le riz. Un bâton de Cassia glissé dans l’eau de cuisson parfume le riz sans le dominer. Retirez-le avant de servir.',
          'Dans un plat de viande mijoté. La cannelle travaille très bien avec l’agneau et la tomate. Un bâton suffit pour quatre personnes, ajouté dès le début de la cuisson.',
          'Dans le café. Une pincée de Ceylan moulue dans le filtre, avant de passer l’eau. Le résultat est plus rond, et demande moins de sucre.',
          'Dans les trois cas, le même principe : la cannelle est un fond, pas un premier rôle. Si on la sent franchement, il y en a trop.',
        ],
      },
      en: {
        title: 'Three ways to cook with cinnamon',
        excerpt:
          'Beyond apple cake: three simple uses that change an everyday dish.',
        body: [
          'In rice. A Cassia stick dropped into the cooking water scents the rice without taking it over. Pull it out before serving.',
          'In a slow-cooked meat dish. Cinnamon works beautifully with lamb and tomato. One stick is enough for four people, added at the start.',
          'In coffee. A pinch of ground Ceylon in the filter, before the water goes through. The result is rounder, and needs less sugar.',
          'In all three cases the same principle applies: cinnamon is a base note, not a lead. If you can clearly taste it, there is too much.',
        ],
      },
    },
  ]

  for (const post of posts) {
    const coverId = await uploadImage(
      `journal-${post.slug}`,
      await placeholderImage(sharp, post.label, post.colours),
      post.alt,
    )

    const avatarId = await uploadImage(
      `author-${post.slug}`,
      await avatarImage(sharp, post.author.initials, post.author.colour),
      { fr: post.author.name, en: post.author.name },
    )

    const publishedAt = new Date(Date.now() - post.daysAgo * 24 * 60 * 60 * 1000).toISOString()

    const created = await payload.create({
      collection: 'posts',
      locale: 'fr',
      data: {
        title: post.fr.title,
        excerpt: post.fr.excerpt,
        content: richText(post.fr.body),
        coverImage: coverId,
        authorName: post.author.name,
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
        title: post.en.title,
        excerpt: post.en.excerpt,
        content: richText(post.en.body),
        _status: 'published',
      },
    })

    payload.logger.info(`article published: ${post.fr.title} / ${post.en.title}`)
  }

  payload.logger.info('--- Done ---')
  payload.logger.info(
    `Admin panel:  ${process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'}/admin`,
  )
  payload.logger.info(`Administrator: ${ADMIN_EMAIL}`)
  payload.logger.info(`Editor:        ${EDITOR_EMAIL}`)
  payload.logger.info('Passwords are the SEED_* values in .env (defaults are in src/seed/seed.ts).')
  payload.logger.info('Change them before sharing the link with anyone outside the project.')
}

await seed()
process.exit(0)
