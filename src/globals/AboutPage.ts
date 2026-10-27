import type { GlobalConfig } from 'payload'

import { ADMIN_GROUPS } from '../adminGroups'
import { isAdminOrEditor } from '../access/roles'

/** "About GROUPE JAOVAZAHA": who the Group is, and its values. */
export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: { fr: 'À propos', en: 'About' },
  admin: { group: ADMIN_GROUPS.pages },

  access: {
    read: () => true,
    update: isAdminOrEditor,
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
      name: 'intro',
      type: 'textarea',
      localized: true,
      label: { fr: 'Introduction', en: 'Introduction' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: { fr: 'Photographie', en: 'Photograph' },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      label: { fr: 'Texte', en: 'Text' },
    },
    {
      name: 'values',
      type: 'array',
      localized: true,
      maxRows: 6,
      label: { fr: 'Valeurs', en: 'Values' },
      labels: {
        singular: { fr: 'Valeur', en: 'Value' },
        plural: { fr: 'Valeurs', en: 'Values' },
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          label: { fr: 'Valeur', en: 'Value' },
        },
        {
          name: 'text',
          type: 'textarea',
          label: { fr: 'Explication', en: 'Explanation' },
        },
      ],
    },
  ],
}
