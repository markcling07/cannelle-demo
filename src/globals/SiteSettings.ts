import type { GlobalConfig } from 'payload'

import { ADMIN_GROUPS } from '../adminGroups'
import { isAdminOrEditor } from '../access/roles'

/**
 * Everything shown on every page — name, logo, tagline, footer and the
 * Group's own contact details. Kept here so they can be changed from the
 * administration area instead of in the code.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: { fr: 'Réglages du site', en: 'Site settings' },
  admin: {
    group: ADMIN_GROUPS.settings,
    description: {
      fr: 'Le nom, le logo, le pied de page et les coordonnées du Groupe, en français et en anglais.',
      en: 'The Group’s name, logo, footer and contact details, in French and in English.',
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
      admin: {
        description: {
          fr: 'Utilisée comme description du site dans les moteurs de recherche.',
          en: 'Used as the site description in search engines.',
        },
      },
    },
    {
      name: 'footerNote',
      type: 'textarea',
      localized: true,
      label: { fr: 'Mention du pied de page', en: 'Footer statement' },
      admin: {
        description: {
          fr: 'Affichée en bas de chaque page. Rappelle que MFC et EAC sont des sociétés indépendantes réunies sous une marque commune.',
          en: 'Shown at the bottom of every page. Explains that MFC and EAC are independent companies sharing a common brand.',
        },
      },
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
      label: { fr: 'Coordonnées du Groupe', en: 'Group contact details' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'contactEmail',
              type: 'email',
              label: { fr: 'Courriel', en: 'Email' },
              admin: { width: '50%' },
            },
            {
              name: 'contactPhone',
              type: 'text',
              label: { fr: 'Téléphone', en: 'Telephone' },
              admin: { width: '50%' },
            },
          ],
        },
        {
          name: 'address',
          type: 'textarea',
          localized: true,
          label: { fr: 'Adresse', en: 'Address' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: { fr: 'Réseaux sociaux', en: 'Social media' },
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'social',
          type: 'array',
          label: false,
          labels: {
            singular: { fr: 'Lien', en: 'Link' },
            plural: { fr: 'Liens', en: 'Links' },
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'network',
                  type: 'select',
                  required: true,
                  label: { fr: 'Réseau', en: 'Network' },
                  admin: { width: '40%' },
                  options: [
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'YouTube', value: 'youtube' },
                  ],
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  label: { fr: 'Adresse', en: 'Address' },
                  admin: { width: '60%' },
                  validate: (value: string | null | undefined) =>
                    !value || /^https:\/\/\S+$/.test(value) || 'https://…',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
