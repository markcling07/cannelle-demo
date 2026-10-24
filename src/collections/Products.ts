import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/roles'
import { slugField } from '../fields/slug'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: { fr: 'Produit', en: 'Product' },
    plural: { fr: 'Produits', en: 'Products' },
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'price', 'stock', '_status', 'updatedAt'],
    group: { fr: 'Contenu', en: 'Content' },
    description: {
      fr: 'Le catalogue. Chaque produit existe en français et en anglais.',
      en: 'The catalogue. Every product exists in French and in English.',
    },
  },

  // Draft / published workflow. Saving keeps the change private; only
  // "Publish" puts it on the public website, and every past version is
  // kept so a mistake can be rolled back.
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },

  access: {
    // Visitors see published products only. Signed-in staff also see drafts,
    // which is what makes the preview-before-publish step work.
    read: ({ req: { user } }) => {
      if (user) return true
      return { _status: { equals: 'published' } }
    },
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { fr: 'Contenu', en: 'Content' },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              label: { fr: 'Nom du produit', en: 'Product name' },
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              localized: true,
              maxLength: 300,
              label: { fr: 'Description courte', en: 'Short description' },
              admin: {
                description: {
                  fr: "Une ou deux phrases, affichées sur la vignette du catalogue.",
                  en: 'One or two sentences, shown on the catalogue card.',
                },
              },
            },
            {
              name: 'description',
              type: 'richText',
              localized: true,
              label: { fr: 'Description complète', en: 'Full description' },
              admin: {
                description: {
                  fr: 'Texte mis en forme : gras, listes, liens, titres.',
                  en: 'Formatted text: bold, lists, links, headings.',
                },
              },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: { fr: 'Photographie principale', en: 'Main photograph' },
              admin: {
                description: {
                  fr: 'La photographie affichée dans le catalogue et en haut de la fiche.',
                  en: 'The photograph shown in the catalogue and at the top of the page.',
                },
              },
            },
            {
              name: 'gallery',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: { fr: 'Photographies supplémentaires', en: 'Additional photographs' },
            },
            {
              name: 'features',
              type: 'array',
              // The whole list is per-language, so the French and English
              // versions can have different wording and even a different
              // number of points.
              localized: true,
              label: { fr: 'Caractéristiques', en: 'Key features' },
              labels: {
                singular: { fr: 'Caractéristique', en: 'Feature' },
                plural: { fr: 'Caractéristiques', en: 'Features' },
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  label: { fr: 'Intitulé', en: 'Label' },
                },
                {
                  name: 'value',
                  type: 'text',
                  label: { fr: 'Valeur', en: 'Value' },
                },
              ],
            },
          ],
        },
        {
          label: { fr: 'Détails commerciaux', en: 'Commercial details' },
          fields: [
            {
              name: 'reference',
              type: 'text',
              label: { fr: 'Référence', en: 'Reference' },
              admin: {
                description: {
                  fr: 'Code interne. Identique dans les deux langues.',
                  en: 'Internal code. The same in both languages.',
                },
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'price',
                  type: 'number',
                  min: 0,
                  label: { fr: 'Prix', en: 'Price' },
                  admin: { width: '50%' },
                },
                {
                  name: 'currency',
                  type: 'select',
                  defaultValue: 'EUR',
                  label: { fr: 'Devise', en: 'Currency' },
                  admin: { width: '50%' },
                  options: [
                    { label: 'EUR (€)', value: 'EUR' },
                    { label: 'USD ($)', value: 'USD' },
                    { label: 'MGA (Ar)', value: 'MGA' },
                  ],
                },
              ],
            },
            {
              name: 'category',
              type: 'relationship',
              relationTo: 'categories',
              label: { fr: 'Catégorie', en: 'Category' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'stock',
                  type: 'number',
                  min: 0,
                  admin: {
                    width: '50%',
                    step: 1,
                    description: {
                      fr: 'Unités disponibles. Diminue à chaque commande ; à 0, le produit ne peut plus être commandé. Laissez vide pour ne pas suivre le stock.',
                      en: 'Units available. Goes down with every order; at 0 the product can no longer be ordered. Leave empty not to track stock.',
                    },
                  },
                  label: { fr: 'Stock', en: 'Stock' },
                },
                {
                  name: 'inStock',
                  type: 'checkbox',
                  defaultValue: true,
                  label: { fr: 'Disponible', en: 'Available' },
                  admin: {
                    width: '50%',
                    description: {
                      fr: 'Décochez pour retirer le produit de la vente, quel que soit le stock.',
                      en: 'Untick to take the product off sale, whatever the stock.',
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    slugField(),

    {
      name: 'publishedAt',
      type: 'date',
      label: { fr: 'Date de publication', en: 'Published date' },
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            // Stamp the publication date the first time it goes live.
            if (siblingData?._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
  ],
}
