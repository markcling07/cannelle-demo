import type { CollectionConfig } from 'payload'

import { ADMIN_GROUPS } from '../adminGroups'
import { isAdminOrEditor, publishedOrLoggedIn } from '../access/roles'
import { slugField } from '../fields/slug'

/**
 * News from the Group and its companies. The collection keeps its original
 * `posts` name so existing content and the database stay as they are.
 * Same draft/publish and French/English behaviour as the catalogue.
 */
export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: { fr: 'Actualité', en: 'News item' },
    plural: { fr: 'Actualités', en: 'News' },
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'authorName', 'publishedAt', '_status'],
    group: ADMIN_GROUPS.news,
    description: {
      fr: 'Les actualités du Groupe, de MFC et d’EAC. Chacune existe en français et en anglais.',
      en: 'News from the Group, MFC and EAC. Each item exists in French and in English.',
    },
  },

  versions: {
    drafts: true,
    maxPerDoc: 20,
  },

  access: {
    read: publishedOrLoggedIn,
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
          fr: 'Une ou deux phrases, affichées sur la vignette de l’actualité.',
          en: 'One or two sentences, shown on the news card.',
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
