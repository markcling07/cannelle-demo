import type { CollectionConfig } from 'payload'

import { ADMIN_GROUPS } from '../adminGroups'
import { isAdminOrEditor, publishedOrLoggedIn } from '../access/roles'
import { slugField } from '../fields/slug'

export const PROJECT_STATUSES = ['planned', 'in-progress', 'completed'] as const

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

/** "Our projects": what the Group and its companies are building. */
export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: { fr: 'Projet', en: 'Project' },
    plural: { fr: 'Projets', en: 'Projects' },
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'company', '_status'],
    group: ADMIN_GROUPS.group,
  },

  defaultSort: 'order',

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
      name: 'summary',
      type: 'textarea',
      localized: true,
      maxLength: 300,
      label: { fr: 'Résumé', en: 'Summary' },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: { fr: 'Photographie', en: 'Photograph' },
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
      label: { fr: 'Description', en: 'Description' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'location',
          type: 'text',
          localized: true,
          label: { fr: 'Lieu', en: 'Location' },
          admin: { width: '50%' },
        },
        {
          name: 'period',
          type: 'text',
          localized: true,
          label: { fr: 'Période', en: 'Period' },
          admin: {
            width: '50%',
            description: { fr: 'Par exemple : 2025 – 2027', en: 'For example: 2025 – 2027' },
          },
        },
      ],
    },

    slugField(),

    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'planned',
      label: { fr: 'Avancement', en: 'Status' },
      options: [
        { value: 'planned', label: { fr: 'En préparation', en: 'Planned' } },
        { value: 'in-progress', label: { fr: 'En cours', en: 'In progress' } },
        { value: 'completed', label: { fr: 'Réalisé', en: 'Completed' } },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'company',
      type: 'relationship',
      relationTo: 'companies',
      label: { fr: 'Porté par', en: 'Led by' },
      admin: {
        position: 'sidebar',
        description: {
          fr: 'Laissez vide pour un projet du Groupe.',
          en: 'Leave empty for a Group project.',
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
