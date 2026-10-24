import type { GlobalConfig } from 'payload'

import { isAdminOrEditor } from '../access/roles'

/**
 * The wording around the catalogue — site name, homepage headline, footer
 * contact details. Kept here so the texts on the public pages can be changed
 * from the administration area instead of in the code.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: { fr: 'Réglages du site', en: 'Site settings' },
  admin: {
    group: { fr: 'Contenu', en: 'Content' },
    description: {
      fr: 'Les textes affichés autour du catalogue, en français et en anglais.',
      en: 'The wording shown around the catalogue, in French and in English.',
    },
  },

  access: {
    read: () => true,
    update: isAdminOrEditor,
  },

  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      localized: true,
      defaultValue: 'GROUPE JAOVAZAHA',
      label: { fr: 'Nom du site', en: 'Site name' },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: { fr: 'Logo', en: 'Logo' },
      admin: {
        description: {
          fr: 'Affiché dans l’en-tête à côté du nom du site, et comme icône de l’onglet. Une image carrée convient le mieux.',
          en: 'Shown in the header beside the site name, and as the browser tab icon. A square image works best.',
        },
      },
    },
    {
      name: 'tagline',
      type: 'text',
      localized: true,
      label: { fr: 'Accroche', en: 'Tagline' },
    },
    {
      name: 'newsletterHeading',
      type: 'textarea',
      localized: true,
      label: { fr: 'Titre de la lettre d’information', en: 'Newsletter heading' },
      admin: {
        description: {
          fr: 'Affiché au-dessus du formulaire d’inscription. Les retours à la ligne sont conservés.',
          en: 'Shown above the sign-up form. Line breaks are kept.',
        },
      },
    },
    {
      type: 'collapsible',
      label: { fr: 'Coordonnées', en: 'Contact details' },
      fields: [
        {
          name: 'contactEmail',
          type: 'email',
          label: { fr: 'Courriel', en: 'Email' },
        },
        {
          name: 'contactPhone',
          type: 'text',
          label: { fr: 'Téléphone', en: 'Telephone' },
        },
        {
          name: 'address',
          type: 'textarea',
          localized: true,
          label: { fr: 'Adresse', en: 'Address' },
        },
      ],
    },
  ],
}
