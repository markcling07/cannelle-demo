import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/roles'
import { slugField } from '../fields/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: { fr: 'Catégorie', en: 'Category' },
    plural: { fr: 'Catégories', en: 'Categories' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
    group: { fr: 'Contenu', en: 'Content' },
    description: {
      fr: 'Familles de produits, par exemple « Épices » ou « Textile ».',
      en: 'Product families, for example "Spices" or "Textiles".',
    },
  },

  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Nom', en: 'Name' },
    },
    slugField(),
  ],
}
