import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/roles'

/**
 * Customer reviews, written from the form on each product page.
 *
 * Every review arrives as "pending" and only appears on the site once a
 * member of staff approves it, so the public form cannot be used to post
 * spam or abuse. The public form goes through a server action; the REST API
 * itself does not accept reviews from visitors.
 */
export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: {
    singular: { fr: 'Avis', en: 'Review' },
    plural: { fr: 'Avis clients', en: 'Reviews' },
  },

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'product', 'rating', 'status', 'createdAt'],
    group: { fr: 'Contenu', en: 'Content' },
    description: {
      fr: 'Avis laissés sur les fiches produits. Un avis n’apparaît sur le site qu’une fois « Approuvé ».',
      en: 'Reviews left on product pages. A review only appears on the site once it is "Approved".',
    },
  },

  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return { status: { equals: 'approved' } }
    },
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },

  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      index: true,
      label: { fr: 'Produit', en: 'Product' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          maxLength: 60,
          label: { fr: 'Nom affiché', en: 'Display name' },
          admin: { width: '50%' },
        },
        {
          name: 'rating',
          type: 'number',
          required: true,
          min: 1,
          max: 5,
          label: { fr: 'Note (1 à 5)', en: 'Rating (1 to 5)' },
          admin: { width: '50%', step: 1 },
        },
      ],
    },
    {
      name: 'comment',
      type: 'textarea',
      required: true,
      maxLength: 1000,
      label: { fr: 'Commentaire', en: 'Comment' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      label: { fr: 'Statut', en: 'Status' },
      options: [
        { label: { fr: 'En attente', en: 'Pending' }, value: 'pending' },
        { label: { fr: 'Approuvé', en: 'Approved' }, value: 'approved' },
        { label: { fr: 'Refusé', en: 'Rejected' }, value: 'rejected' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'language',
      type: 'select',
      label: { fr: 'Langue', en: 'Language' },
      options: [
        { label: 'Français', value: 'fr' },
        { label: 'English', value: 'en' },
      ],
      admin: {
        position: 'sidebar',
        description: {
          fr: 'La langue du site au moment de l’avis.',
          en: 'The language of the site when the review was written.',
        },
      },
    },
  ],
}
