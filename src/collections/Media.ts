import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { fr: 'Photographie', en: 'Photograph' },
    plural: { fr: 'Médiathèque', en: 'Media library' },
  },
  admin: {
    group: { fr: 'Contenu', en: 'Content' },
    description: {
      fr: 'Toutes les photographies du site. Glissez un fichier pour le téléverser.',
      en: 'Every photograph used on the site. Drag a file in to upload it.',
    },
  },

  access: {
    // Photographs must be readable by the public website.
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },

  upload: {
    mimeTypes: ['image/*'],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    // Payload generates these sizes on upload so the public site can send a
    // small file to a phone and a large one to a desktop.
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 400, position: 'centre' },
      { name: 'card', width: 768, height: 576, position: 'centre' },
      { name: 'hero', width: 1600, height: 1000, position: 'centre' },
    ],
  },

  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      // Alternative text is what a screen reader announces and what Google
      // reads, so it belongs in both languages.
      localized: true,
      label: { fr: 'Texte alternatif', en: 'Alternative text' },
      admin: {
        description: {
          fr: "Décrivez la photographie en quelques mots. Important pour l'accessibilité et le référencement.",
          en: 'Describe the photograph in a few words. Important for accessibility and SEO.',
        },
      },
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
      label: { fr: 'Légende', en: 'Caption' },
    },
  ],
}
