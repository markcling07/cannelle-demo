import type { CollectionConfig } from 'payload'

import { ADMIN_GROUPS } from '../adminGroups'
import { isAdminOrEditor, publishedOrLoggedIn } from '../access/roles'
import { slugField } from '../fields/slug'

/**
 * The professional catalogue. No prices, stock or basket: every product page
 * leads to a quotation request or to the team instead.
 */
export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: { fr: 'Produit', en: 'Product' },
    plural: { fr: 'Produits', en: 'Products' },
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'company', '_status', 'updatedAt'],
    group: ADMIN_GROUPS.catalogue,
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
    read: publishedOrLoggedIn,
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
              label: { fr: 'Fiche technique', en: 'Technical information' },
              labels: {
                singular: { fr: 'Ligne', en: 'Row' },
                plural: { fr: 'Lignes', en: 'Rows' },
              },
              admin: {
                description: {
                  fr: 'Une ligne par information : espèce, origine, calibre, conditionnement, certification…',
                  en: 'One row per item: species, origin, grade, packaging, certification…',
                },
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
          label: { fr: 'Classement et liens', en: 'Classification and links' },
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
                  name: 'category',
                  type: 'relationship',
                  relationTo: 'categories',
                  label: { fr: 'Catégorie', en: 'Category' },
                  admin: { width: '50%' },
                },
                {
                  name: 'company',
                  type: 'relationship',
                  relationTo: 'companies',
                  label: { fr: 'Société', en: 'Company' },
                  admin: {
                    width: '50%',
                    description: {
                      fr: 'La société du Groupe qui propose ce produit.',
                      en: 'The Group company that supplies this product.',
                    },
                  },
                },
              ],
            },
            {
              name: 'shopUrl',
              type: 'text',
              label: { fr: 'Lien vers la boutique en ligne EAC', en: 'Link to the EAC online store' },
              validate: (value: string | null | undefined) =>
                !value || /^https:\/\/\S+$/.test(value) || 'https://…',
              admin: {
                description: {
                  fr: 'Facultatif. Adresse complète du produit sur la future boutique Shopify d’EAC. Le bouton n’apparaît que si ce champ est rempli.',
                  en: 'Optional. Full address of the product on EAC’s future Shopify store. The button only appears when this is filled in.',
                },
              },
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
