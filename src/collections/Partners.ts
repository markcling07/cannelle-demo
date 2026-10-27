import type { CollectionConfig } from 'payload'

import { ADMIN_GROUPS } from '../adminGroups'
import { isAdminOrEditor } from '../access/roles'

export const PARTNER_TYPES = [
  'cooperative',
  'logistics',
  'laboratory',
  'distributor',
  'institutional',
  'other',
] as const

export type PartnerType = (typeof PARTNER_TYPES)[number]

/** Growers, logistics firms, laboratories… shown on "Partnerships". */
export const Partners: CollectionConfig = {
  slug: 'partners',
  labels: {
    singular: { fr: 'Partenaire', en: 'Partner' },
    plural: { fr: 'Partenaires', en: 'Partners' },
  },

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'country', 'order'],
    group: ADMIN_GROUPS.group,
  },

  defaultSort: 'order',

  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },

  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: { fr: 'Nom', en: 'Name' },
          admin: { width: '50%' },
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'other',
          label: { fr: 'Type', en: 'Type' },
          admin: { width: '50%' },
          options: [
            { value: 'cooperative', label: { fr: 'Coopérative / producteurs', en: 'Cooperative / growers' } },
            { value: 'logistics', label: { fr: 'Logistique', en: 'Logistics' } },
            { value: 'laboratory', label: { fr: 'Laboratoire / certification', en: 'Laboratory / certification' } },
            { value: 'distributor', label: { fr: 'Distribution', en: 'Distribution' } },
            { value: 'institutional', label: { fr: 'Institution', en: 'Institution' } },
            { value: 'other', label: { fr: 'Autre', en: 'Other' } },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'country',
          type: 'text',
          localized: true,
          label: { fr: 'Pays', en: 'Country' },
          admin: { width: '50%' },
        },
        {
          name: 'website',
          type: 'text',
          label: { fr: 'Site web', en: 'Website' },
          admin: { width: '50%' },
          validate: (value: string | null | undefined) =>
            !value || /^https?:\/\/\S+$/.test(value) || 'https://…',
        },
      ],
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: { fr: 'Logo', en: 'Logo' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      maxLength: 400,
      label: { fr: 'Description', en: 'Description' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: { fr: 'Ordre d’affichage', en: 'Display order' },
      admin: { position: 'sidebar' },
    },
  ],
}
