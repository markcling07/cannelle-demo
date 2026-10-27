import type { CollectionConfig } from 'payload'

import { ADMIN_GROUPS } from '../adminGroups'
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
    group: ADMIN_GROUPS.catalogue,
    description: {
      fr: 'Familles de produits, par exemple « Vanille » ou « Épices ».',
      en: 'Product families, for example "Vanilla" or "Spices".',
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
