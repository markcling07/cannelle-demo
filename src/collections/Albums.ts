import type { CollectionConfig } from 'payload'

import { ADMIN_GROUPS } from '../adminGroups'
import { isAdminOrEditor } from '../access/roles'

/**
 * The gallery, organised in albums. Each photograph's caption comes from its
 * own entry in the media library, so it is written once and reused.
 */
export const Albums: CollectionConfig = {
  slug: 'albums',
  labels: {
    singular: { fr: 'Album', en: 'Album' },
    plural: { fr: 'Galerie', en: 'Gallery' },
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'order'],
    group: ADMIN_GROUPS.media,
    description: {
      fr: 'Les albums de la page Galerie. La légende de chaque photographie se modifie dans la médiathèque.',
      en: 'The albums on the Gallery page. Each photograph’s caption is edited in the media library.',
    },
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
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Titre', en: 'Title' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: { fr: 'Description', en: 'Description' },
    },
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      label: { fr: 'Photographies', en: 'Photographs' },
      admin: {
        description: {
          fr: 'La première sert de couverture. Glissez pour changer l’ordre.',
          en: 'The first one is the cover. Drag to reorder.',
        },
      },
    },
    {
      name: 'date',
      type: 'date',
      label: { fr: 'Date', en: 'Date' },
      admin: { position: 'sidebar', date: { pickerAppearance: 'monthOnly' } },
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
