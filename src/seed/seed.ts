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
 *
 * Journal covers follow the same rule as `journal-<slug>`, ideally 1600x1000
 * so they fill the 16:10 article header exactly.
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
  ]

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
        fr: 'Bâtons de cannelle de différentes épaisseurs sur un linge clair',
        en: 'Cinnamon sticks of different thicknesses on pale linen',
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
        fr: 'Tasse de café et bâtons de cannelle',
        en: 'A cup of coffee and cinnamon sticks',
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
    {
      slug: 'chocolat-chaud',
      label: 'Recette',
      colours: ['#3b2114', '#8b5a34'] as [string, string],
      alt: {
        fr: 'Chocolat chaud, bâtons de cannelle et carrés de chocolat noir',
        en: 'Hot chocolate, cinnamon sticks and squares of dark chocolate',
      },
      author: { name: 'Léa Marchand', initials: 'LM', colour: '#5c3a1e' },
      daysAgo: 2,
      fr: {
        title: 'Chocolat chaud à la cannelle et à la vanille',
        excerpt:
          'Une recette pour deux tasses : du chocolat noir, une demi-gousse de vanille et un bâton de Ceylan.',
        body: [
          'Pour deux tasses : 50 cl de lait entier, 1 bâton de cannelle de Ceylan, ½ gousse de vanille, 80 g de chocolat noir à 70 %, une pincée de sel, et du sucre selon votre goût.',
          'Fendez la demi-gousse dans la longueur et grattez les graines dans le lait. Ajoutez la gousse vidée et le bâton de cannelle, portez à frémissement, puis couvrez et laissez infuser dix minutes hors du feu. Retirez la gousse et le bâton.',
          'Remettez sur feu doux, ajoutez le chocolat haché et le sel, et fouettez sans laisser bouillir jusqu’à ce que le mélange épaississe légèrement. Goûtez avant de sucrer : un chocolat à 70 % en demande peu.',
          'Pour une version plus intense, faites infuser une cuillère à soupe d’éclats de fèves de cacao avec les épices, puis filtrez. Un clou de girofle apporte une note plus chaude, mais un seul suffit. Rincée et séchée, la gousse de vanille parfumera ensuite un bocal de sucre.',
        ],
      },
      en: {
        title: 'Hot chocolate with cinnamon and vanilla',
        excerpt:
          'A recipe for two cups: dark chocolate, half a vanilla pod and a Ceylon quill.',
        body: [
          'For two cups: 500 ml whole milk, 1 Ceylon cinnamon quill, ½ vanilla pod, 80 g dark chocolate (70%), a pinch of salt, and sugar to taste.',
          'Split the half pod lengthways and scrape the seeds into the milk. Add the empty pod and the cinnamon, bring to a simmer, then cover and leave to infuse off the heat for ten minutes. Lift out the pod and the quill.',
          'Return the pan to a low heat, add the chopped chocolate and the salt, and whisk without letting it boil until it thickens slightly. Taste before adding sugar: a 70% chocolate needs very little.',
          'For a deeper version, infuse a tablespoon of cocoa nibs along with the spices, then strain. A single clove adds a warmer note, but one is plenty. Rinsed and dried, the vanilla pod will go on to scent a jar of sugar.',
        ],
      },
    },
    {
      slug: 'vanille-affinage',
      label: 'Vanille',
      colours: ['#2a1a10', '#6e4a2c'] as [string, string],
      alt: {
        fr: 'Gousses de vanille noires et souples sur un linge blanc',
        en: 'Supple black vanilla pods on white linen',
      },
      author: { name: 'Hanta Rakoto', initials: 'HR', colour: '#7a4418' },
      daysAgo: 18,
      fr: {
        title: 'De la gousse verte à la gousse noire : l’affinage de la vanille',
        excerpt:
          'Au moment de la cueillette, la vanille est verte et ne sent presque rien. Son parfum naît pendant des mois de préparation.',
        body: [
          'Une gousse de vanille fraîchement cueillie est verte, ferme et presque inodore. La vanilline y est encore liée à un sucre, sous forme de glucovanilline, et ne se libère qu’au cours d’une lente transformation.',
          'Dans la région SAVA, les gousses sont d’abord échaudées : plongées quelques minutes dans une eau à environ 65 °C, ce qui arrête leur maturation. Elles passent ensuite un jour ou deux enveloppées de couvertures au fond de caisses en bois, où elles « suent » et commencent à brunir.',
          'Viennent alors des semaines d’alternance : exposées au soleil quelques heures par jour, puis rentrées pour transpirer de nouveau. Les gousses perdent peu à peu leur eau, deviennent souples et prennent leur couleur noire. Il faut en moyenne cinq à six kilos de vanille verte pour obtenir un kilo de vanille préparée.',
          'Reste l’affinage : deux à trois mois de repos dans des malles fermées, avec un tri gousse par gousse. C’est là que le parfum s’arrondit. Sur les plus belles gousses apparaissent parfois de fins cristaux blancs, le givre : ce n’est pas de la moisissure, mais de la vanilline.',
        ],
      },
      en: {
        title: 'From green pod to black pod: how vanilla is cured',
        excerpt:
          'When it is picked, vanilla is green and has almost no scent. Its fragrance develops over months of careful preparation.',
        body: [
          'A freshly picked vanilla pod is green, firm and almost odourless. Its vanillin is still bound to a sugar, as glucovanillin, and is only released through a slow transformation.',
          'In the SAVA region the pods are first blanched: dipped for a few minutes in water at around 65 °C, which stops them ripening. They then spend a day or two wrapped in blankets at the bottom of wooden boxes, where they "sweat" and begin to turn brown.',
          'Weeks of alternation follow: a few hours in the sun each day, then back indoors to sweat again. The pods slowly lose their water, become supple and turn black. On average it takes five to six kilos of green vanilla to make one kilo of cured vanilla.',
          'Last comes conditioning: two to three months resting in closed trunks, sorted pod by pod. This is where the scent rounds out. The finest pods sometimes grow fine white crystals, known as frost. It is not mould, but vanillin.',
        ],
      },
    },
    {
      slug: 'cacao-fermentation',
      label: 'Cacao',
      colours: ['#3b2114', '#8b5a34'] as [string, string],
      alt: {
        fr: 'Cabosse de cacao ouverte, fèves dans leur pulpe blanche',
        en: 'An open cacao pod, beans in their white pulp',
      },
      author: { name: 'Tojo Andrianaivo', initials: 'TA', colour: '#4f2410' },
      daysAgo: 25,
      fr: {
        title: 'Ce que la fermentation donne au cacao',
        excerpt:
          'Une fève de cacao crue n’a pas le goût du chocolat. Il apparaît en sept jours, dans une caisse en bois.',
        body: [
          'À l’ouverture d’une cabosse, les fèves sont enrobées d’une pulpe blanche, sucrée et acidulée. La fève elle-même, croquée crue, est amère, astringente, et n’évoque en rien le chocolat.',
          'Dans le Sambirano, fèves et pulpe sont versées dans des caisses en bois et couvertes de feuilles de bananier. Les levures transforment d’abord les sucres de la pulpe en alcool, que des bactéries changent ensuite en acide acétique. La masse chauffe jusqu’à 45 à 50 °C.',
          'Tous les deux jours environ, les fèves sont brassées, passées d’une caisse à l’autre pour y faire entrer de l’air. Le germe meurt, la fève vire du violet au brun, et se forment les précurseurs des arômes que la torréfaction révélera plus tard.',
          'Au bout de sept jours, les fèves sont séchées au soleil jusqu’à ne plus contenir qu’environ 7 % d’eau. Pour vérifier le travail, on en coupe un échantillon dans la longueur : une fève bien fermentée est brune et fissurée à l’intérieur ; une fève grise et compacte, dite « ardoisée », ne l’a pas été.',
        ],
      },
      en: {
        title: 'What fermentation gives cacao',
        excerpt:
          'A raw cacao bean does not taste of chocolate. That flavour appears over seven days, in a wooden box.',
        body: [
          'When a pod is opened, the beans are coated in a white pulp, sweet and tart. The bean itself, bitten raw, is bitter and astringent, and tastes nothing like chocolate.',
          'In the Sambirano, beans and pulp are tipped into wooden boxes and covered with banana leaves. Yeasts first turn the sugars in the pulp into alcohol, which bacteria then convert into acetic acid. The mass heats up to 45–50 °C.',
          'Every couple of days the beans are turned, moved from one box to the next to let air in. The germ dies, the bean shifts from purple to brown, and the precursors of the flavours that roasting will later bring out begin to form.',
          'After seven days the beans are dried in the sun until only about 7% water remains. To check the work, a sample is cut lengthways: a well-fermented bean is brown and cracked inside; a grey, dense bean, known as "slaty", was not fermented.',
        ],
      },
    },
    {
      slug: 'conserver-epices',
      label: 'Conseils',
      colours: ['#5e3418', '#bf8347'] as [string, string],
      alt: {
        fr: 'Bocaux d’épices en verre sur une étagère',
        en: 'Glass jars of spices on a shelf',
      },
      author: { name: 'Léa Marchand', initials: 'LM', colour: '#5c3a1e' },
      daysAgo: 32,
      fr: {
        title: 'Bien conserver ses épices',
        excerpt:
          'La lumière, l’air, la chaleur et l’humidité : quatre ennemis, et quelques gestes simples pour garder le parfum plus longtemps.',
        body: [
          'Une épice ne se gâte pas vraiment : elle s’éteint. Son parfum tient dans des huiles essentielles volatiles, qui s’échappent un peu plus chaque fois que le bocal reste ouvert, au soleil ou près d’une source de chaleur.',
          'Le bon endroit est donc un placard sombre, loin de la cuisinière et du four, dans des bocaux qui ferment bien. Le verre convient parfaitement, à condition d’être rangé à l’abri de la lumière. Et jamais de cuillère humide dans le bocal : l’humidité fait prendre la poudre en masse et peut faire moisir les baies.',
          'Achetez entier quand c’est possible. Un bâton de cannelle ou un clou de girofle garde son parfum deux à trois ans ; la même épice moulue commence à faiblir au bout de six mois à un an. Un petit moulin réservé aux épices suffit pour moudre au dernier moment.',
          'Deux cas particuliers : la vanille se garde dans un tube ou un papier bien fermé, au frais mais pas au réfrigérateur ; les huiles essentielles restent dans leur flacon ambré, bouchon bien vissé. Et pour savoir si une épice est encore bonne, frottez-en un peu entre vos doigts : si l’odeur est faible, il est temps de la renouveler.',
        ],
      },
      en: {
        title: 'How to store your spices',
        excerpt:
          'Light, air, heat and moisture: four enemies, and a few simple habits that keep the scent alive for longer.',
        body: [
          'Spices do not really go off: they fade. Their scent lives in volatile essential oils, which escape a little more every time the jar is left open, in the sun or near a source of heat.',
          'The right place is a dark cupboard, away from the hob and the oven, in jars that close properly. Glass is perfect, as long as it is kept out of the light. And never put a damp spoon in the jar: moisture makes powders cake and can turn berries mouldy.',
          'Buy whole whenever you can. A cinnamon stick or a clove keeps its scent for two to three years; the same spice ground starts to fade after six months to a year. A small grinder kept just for spices is all you need to grind at the last minute.',
          'Two special cases: vanilla keeps in a tube or tightly closed paper, somewhere cool but not in the fridge; essential oils stay in their amber bottle with the cap screwed on tight. To tell whether a spice is still good, rub a little between your fingers: if the smell is faint, it is time to replace it.',
        ],
      },
    },
  ]

  for (const post of posts) {
    const cover = findPhoto(`journal-${post.slug}`)
    if (cover) payload.logger.info(`using real photograph for journal-${post.slug}`)

    const coverId = await uploadImage(
      `journal-${post.slug}`,
      cover?.buffer ?? (await placeholderImage(sharp, post.label, post.colours)),
      post.alt,
      cover?.ext ?? 'jpg',
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
