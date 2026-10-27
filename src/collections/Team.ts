import type { CollectionConfig } from 'payload'

import { ADMIN_GROUPS } from '../adminGroups'
import { isAdminOrEditor } from '../access/roles'

/** The founder and the management team, shown on "Founder and management". */
export const Team: CollectionConfig = {
  slug: 'team',
  labels: {
    singular: { fr: 'Membre de la direction', en: 'Team member' },
    plural: { fr: 'Fondateur et direction', en: 'Founder and management' },
  },

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'company', 'order'],
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
          name: 'role',
          type: 'text',
          required: true,
          localized: true,
          label: { fr: 'Fonction', en: 'Role' },
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'company',
      type: 'relationship',
      relationTo: 'companies',
      label: { fr: 'Société', en: 'Company' },
      admin: {
        description: {
          fr: 'Laissez vide pour un rôle au niveau du Groupe.',
          en: 'Leave empty for a role at Group level.',
        },
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: { fr: 'Portrait', en: 'Portrait' },
    },
    {
      name: 'bio',
      type: 'textarea',
      localized: true,
      label: { fr: 'Présentation', en: 'Biography' },
    },
    {
      name: 'isFounder',
      type: 'checkbox',
      label: { fr: 'Fondateur', en: 'Founder' },
      admin: {
        position: 'sidebar',
        description: {
          fr: 'Mis en avant en tête de page.',
          en: 'Featured at the top of the page.',
        },
      },
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
