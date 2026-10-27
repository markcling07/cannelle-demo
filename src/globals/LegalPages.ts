import type { Field, GlobalConfig } from 'payload'

import { ADMIN_GROUPS } from '../adminGroups'
import { isAdminOrEditor } from '../access/roles'

const page = (name: string): Field => ({
  name,
  type: 'group',
  label: false,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Titre', en: 'Title' },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      label: { fr: 'Texte', en: 'Text' },
    },
  ],
})

/** Legal notice and privacy policy, one tab each. */
export const LegalPages: GlobalConfig = {
  slug: 'legal-pages',
  label: { fr: 'Mentions légales et confidentialité', en: 'Legal notice and privacy' },
  admin: {
    group: ADMIN_GROUPS.pages,
    description: {
      fr: 'À faire valider par un juriste avant la mise en ligne définitive.',
      en: 'To be checked by a lawyer before the final launch.',
    },
  },

  access: {
    read: () => true,
    update: isAdminOrEditor,
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { fr: 'Mentions légales', en: 'Legal notice' },
          fields: [page('legalNotice')],
        },
        {
          label: { fr: 'Confidentialité', en: 'Privacy policy' },
          fields: [page('privacy')],
        },
      ],
    },
  ],
}
