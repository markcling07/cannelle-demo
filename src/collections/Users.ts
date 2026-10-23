import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrSelf, isAdminFieldLevel } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: { fr: 'Utilisateur', en: 'User' },
    plural: { fr: 'Utilisateurs', en: 'Users' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'roles'],
    group: { fr: 'Administration', en: 'Administration' },
    description: {
      fr: 'Comptes autorisés à se connecter à cette administration.',
      en: 'Accounts allowed to sign in to this administration area.',
    },
  },

  // Secure login: Payload handles password hashing (scrypt), HTTP-only
  // session cookies, and account lockout after repeated failed attempts.
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000, // 10 minutes
    tokenExpiration: 8 * 60 * 60, // 8 hours
  },

  access: {
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
    admin: () => true, // any signed-in user may open the admin panel
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: { fr: 'Nom', en: 'Name' },
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['editor'],
      label: { fr: 'Rôles', en: 'Roles' },
      // Only an administrator can change roles, so an editor cannot
      // promote their own account.
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
      options: [
        {
          label: { fr: 'Administrateur', en: 'Administrator' },
          value: 'admin',
        },
        {
          label: { fr: 'Éditeur', en: 'Editor' },
          value: 'editor',
        },
      ],
      admin: {
        description: {
          fr: "L'éditeur gère les produits, catégories et photographies. L'administrateur gère en plus les comptes.",
          en: 'An editor manages products, categories and photographs. An administrator also manages accounts.',
        },
      },
    },
  ],
}
