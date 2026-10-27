import type { CollectionConfig } from 'payload'

import { ADMIN_GROUPS } from '../adminGroups'
import { isAdmin, isAdminOrEditor, publishedOrLoggedIn } from '../access/roles'
import { slugField } from '../fields/slug'

/**
 * The legally independent businesses under the GROUPE JAOVAZAHA brand —
 * today MFC in Madagascar and EAC in France. Each gets its own page, so the
 * site never presents the Group itself as the legal entity.
 */
export const Companies: CollectionConfig = {
  slug: 'companies',
  labels: {
    singular: { fr: 'Société', en: 'Company' },
    plural: { fr: 'Sociétés', en: 'Companies' },
  },

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['shortName', 'name', 'country', '_status'],
    group: ADMIN_GROUPS.group,
    description: {
      fr: 'Les sociétés juridiquement indépendantes réunies sous la marque GROUPE JAOVAZAHA.',
      en: 'The legally independent companies brought together under the GROUPE JAOVAZAHA brand.',
    },
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
    // Removing a whole company is rare and far-reaching: administrators only.
    delete: isAdmin,
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { fr: 'Présentation', en: 'Presentation' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'shortName',
                  type: 'text',
                  required: true,
                  label: { fr: 'Sigle', en: 'Short name' },
                  admin: { width: '30%', description: { fr: 'Par exemple : MFC', en: 'For example: MFC' } },
                },
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  label: { fr: 'Nom complet', en: 'Full name' },
                  admin: { width: '70%' },
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
                  admin: { width: '30%' },
                },
                {
                  name: 'tagline',
                  type: 'text',
                  localized: true,
                  label: { fr: 'Activité en une ligne', en: 'Activity in one line' },
                  admin: { width: '70%' },
                },
              ],
            },
            {
              name: 'summary',
              type: 'textarea',
              localized: true,
              maxLength: 400,
              label: { fr: 'Résumé', en: 'Summary' },
              admin: {
                description: {
                  fr: 'Deux ou trois phrases, affichées sur l’accueil et sur la page « Nos sociétés ».',
                  en: 'Two or three sentences, shown on the home page and on "Our companies".',
                },
              },
            },
            {
              name: 'description',
              type: 'richText',
              localized: true,
              label: { fr: 'Présentation complète', en: 'Full presentation' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'logo',
                  type: 'upload',
                  relationTo: 'media',
                  label: { fr: 'Logo', en: 'Logo' },
                  admin: { width: '50%' },
                },
                {
                  name: 'coverImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: { fr: 'Photographie de couverture', en: 'Cover photograph' },
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'keyFacts',
              type: 'array',
              localized: true,
              label: { fr: 'En bref', en: 'At a glance' },
              labels: {
                singular: { fr: 'Information', en: 'Fact' },
                plural: { fr: 'Informations', en: 'Facts' },
              },
              admin: {
                description: {
                  fr: 'Quelques repères : activités, zone d’approvisionnement, marchés…',
                  en: 'A few landmarks: activities, sourcing area, markets…',
                },
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                      label: { fr: 'Intitulé', en: 'Label' },
                      admin: { width: '40%' },
                    },
                    {
                      name: 'value',
                      type: 'text',
                      required: true,
                      label: { fr: 'Valeur', en: 'Value' },
                      admin: { width: '60%' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: { fr: 'Informations légales', en: 'Legal information' },
          description: {
            fr: 'Affichées sur la page de la société et dans les mentions légales. Laissez vide ce qui n’est pas encore confirmé.',
            en: 'Shown on the company page and in the legal notice. Leave empty anything not yet confirmed.',
          },
          fields: [
            {
              name: 'legal',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'legalName',
                  type: 'text',
                  label: { fr: 'Dénomination sociale', en: 'Registered name' },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'legalForm',
                      type: 'text',
                      localized: true,
                      label: { fr: 'Forme juridique', en: 'Legal form' },
                      admin: { width: '50%' },
                    },
                    {
                      name: 'registration',
                      type: 'text',
                      label: { fr: 'Immatriculation (RCS, NIF, STAT…)', en: 'Registration number' },
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  name: 'registeredAddress',
                  type: 'textarea',
                  label: { fr: 'Siège social', en: 'Registered office' },
                },
              ],
            },
          ],
        },
        {
          label: { fr: 'Contact', en: 'Contact' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'email',
                  type: 'email',
                  label: { fr: 'Courriel', en: 'Email' },
                  admin: { width: '50%' },
                },
                {
                  name: 'phone',
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
            {
              name: 'website',
              type: 'text',
              label: { fr: 'Site web', en: 'Website' },
              validate: (value: string | null | undefined) =>
                !value || /^https?:\/\/\S+$/.test(value) || 'https://…',
            },
          ],
        },
      ],
    },

    slugField('shortName'),

    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: { fr: 'Ordre d’affichage', en: 'Display order' },
      admin: {
        position: 'sidebar',
        description: { fr: 'Les plus petits en premier.', en: 'Lowest first.' },
      },
    },
  ],
}
