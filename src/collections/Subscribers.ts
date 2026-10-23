import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, isAdmin } from '../access/roles'

/**
 * Newsletter sign-ups from the public site.
 *
 * Anyone may create one — that is the point of the form — but only signed-in
 * staff can read the list, and only an administrator can remove entries.
 */
export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: {
    singular: { fr: 'Inscrit', en: 'Subscriber' },
    plural: { fr: 'Lettre d’information', en: 'Newsletter' },
  },

  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'locale', 'createdAt'],
    group: { fr: 'Administration', en: 'Administration' },
    description: {
      fr: 'Adresses saisies dans le formulaire du site public.',
      en: 'Addresses entered in the form on the public site.',
    },
  },

  access: {
    read: isAdminOrEditor,
    create: () => true,
    update: isAdminOrEditor,
    delete: isAdmin,
  },

  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      index: true,
      label: { fr: 'Adresse e-mail', en: 'Email address' },
    },
    {
      name: 'locale',
      type: 'select',
      label: { fr: 'Langue', en: 'Language' },
      options: [
        { label: 'Français', value: 'fr' },
        { label: 'English', value: 'en' },
      ],
      admin: {
        description: {
          fr: 'La langue du site au moment de l’inscription.',
          en: 'The language of the site when they signed up.',
        },
      },
    },
  ],
}
