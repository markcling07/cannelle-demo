import type { GlobalConfig } from 'payload'

import { ADMIN_GROUPS } from '../adminGroups'
import { isAdminOrEditor } from '../access/roles'

/**
 * The home page: GROUPE JAOVAZAHA first, then the companies beneath it.
 * The structure diagram itself is drawn from the Companies collection, so
 * only the words around it live here.
 */
export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: { fr: 'Accueil', en: 'Home page' },
  admin: {
    group: ADMIN_GROUPS.pages,
    description: {
      fr: 'Les textes et la photographie de la page d’accueil. Les sociétés, produits et actualités affichés viennent de leurs propres rubriques.',
      en: 'The words and photograph on the home page. The companies, products and news shown come from their own sections.',
    },
  },

  access: {
    read: () => true,
    update: isAdminOrEditor,
  },

  fields: [
    {
      name: 'hero',
      type: 'group',
      label: { fr: 'Bandeau d’accueil', en: 'Hero banner' },
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          localized: true,
          label: { fr: 'Surtitre', en: 'Eyebrow' },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: { fr: 'Titre', en: 'Title' },
        },
        {
          name: 'text',
          type: 'textarea',
          localized: true,
          label: { fr: 'Texte', en: 'Text' },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: { fr: 'Photographie', en: 'Photograph' },
          admin: {
            description: {
              fr: 'Format paysage, au moins 2400 × 1500 px.',
              en: 'Landscape, at least 2400 × 1500 px.',
            },
          },
        },
      ],
    },
    {
      name: 'structure',
      type: 'group',
      label: { fr: 'Le Groupe et ses sociétés', en: 'The Group and its companies' },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          label: { fr: 'Titre', en: 'Title' },
        },
        {
          name: 'text',
          type: 'textarea',
          localized: true,
          label: { fr: 'Texte', en: 'Text' },
        },
        {
          name: 'note',
          type: 'textarea',
          localized: true,
          label: { fr: 'Précision juridique', en: 'Legal clarification' },
          admin: {
            description: {
              fr: 'Affichée sous le schéma. Précise que GROUPE JAOVAZAHA est une marque commune et non une société holding.',
              en: 'Shown under the diagram. Makes clear that GROUPE JAOVAZAHA is a shared brand, not a holding company.',
            },
          },
        },
      ],
    },
    {
      name: 'featuredProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      maxRows: 6,
      label: { fr: 'Produits mis en avant', en: 'Featured products' },
      admin: {
        description: {
          fr: 'Jusqu’à six produits publiés, dans l’ordre choisi.',
          en: 'Up to six published products, in the order chosen.',
        },
      },
    },
    {
      name: 'closing',
      type: 'group',
      label: { fr: 'Appel à nous contacter', en: 'Contact call-to-action' },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          label: { fr: 'Titre', en: 'Title' },
        },
        {
          name: 'text',
          type: 'textarea',
          localized: true,
          label: { fr: 'Texte', en: 'Text' },
        },
      ],
    },
  ],
}
