import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/roles'
import { slugField } from '../fields/slug'

/**
 * The journal — short articles about cinnamon, its origins and how to use it.
 * Same draft/publish and French/English behaviour as the catalogue.
 */
export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: { fr: 'Article', en: 'Article' },
    plural: { fr: 'Journal', en: 'Journal' },
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'authorName', 'publishedAt', '_status'],
    group: { fr: 'Contenu', en: 'Content' },
    description: {
      fr: 'Articles du journal. Chaque article existe en français et en anglais.',
      en: 'Journal articles. Every article exists in French and in English.',
    },
  },

  versions: {
    drafts: true,
    maxPerDoc: 20,
  },

  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return { _status: { equals: 'published' } }
    },
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
      label: { fr: 'Titre', en: 'Title' },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      maxLength: 300,
      label: { fr: 'Résumé', en: 'Excerpt' },
      admin: {
        description: {
          fr: 'Une ou deux phrases, affichées sur la vignette du journal.',
          en: 'One or two sentences, shown on the journal card.',
        },
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: { fr: 'Image de couverture', en: 'Cover image' },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      label: { fr: 'Contenu', en: 'Content' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'authorName',
          type: 'text',
          required: true,
          label: { fr: 'Auteur', en: 'Author' },
          admin: {
            width: '50%',
            description: {
              fr: 'Identique dans les deux langues.',
              en: 'The same in both languages.',
            },
          },
        },
        {
          name: 'authorAvatar',
          type: 'upload',
          relationTo: 'media',
          label: { fr: "Photo de l'auteur", en: 'Author photo' },
          admin: { width: '50%' },
        },
      ],
    },

    slugField(),

    {
      name: 'publishedAt',
      type: 'date',
      label: { fr: 'Date de publication', en: 'Published date' },
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData?._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
  ],
}
