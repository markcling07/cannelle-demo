import type { Field, GlobalConfig } from 'payload'

import { ADMIN_GROUPS } from '../adminGroups'
import { isAdminOrEditor } from '../access/roles'

/** One title and introduction per listing page. */
const intro = (name: string, label: { fr: string; en: string }, extra: Field[] = []): Field => ({
  name,
  type: 'group',
  label,
  admin: { hideGutter: true },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      label: { fr: 'Titre', en: 'Title' },
    },
    {
      name: 'intro',
      type: 'textarea',
      localized: true,
      label: { fr: 'Introduction', en: 'Introduction' },
    },
    ...extra,
  ],
})

/**
 * The heading and short introduction at the top of each listing page.
 * Left empty, a page falls back to its plain name from the menu.
 */
export const SectionIntros: GlobalConfig = {
  slug: 'section-intros',
  label: { fr: 'Introductions des rubriques', en: 'Section introductions' },
  admin: {
    group: ADMIN_GROUPS.pages,
    description: {
      fr: 'Le titre et le court texte en haut de chaque rubrique du site.',
      en: 'The title and short text at the top of each section of the site.',
    },
  },

  access: {
    read: () => true,
    update: isAdminOrEditor,
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { fr: 'Groupe', en: 'Group' },
          fields: [
            intro('companies', { fr: 'Nos sociétés', en: 'Our companies' }),
            intro('leadership', { fr: 'Fondateur et direction', en: 'Founder and management' }),
            intro('projects', { fr: 'Nos projets', en: 'Our projects' }),
            intro('partnerships', { fr: 'Partenariats', en: 'Partnerships' }),
          ],
        },
        {
          label: { fr: 'Catalogue', en: 'Catalogue' },
          fields: [intro('products', { fr: 'Nos produits', en: 'Our products' })],
        },
        {
          label: { fr: 'Actualités et galerie', en: 'News and gallery' },
          fields: [
            intro('news', { fr: 'Actualités', en: 'News' }, [
              {
                name: 'statement',
                type: 'textarea',
                localized: true,
                label: { fr: 'Phrase d’accroche', en: 'Statement' },
              },
              {
                name: 'accent',
                type: 'text',
                localized: true,
                label: { fr: 'Fin de la phrase, en couleur', en: 'End of the statement, in colour' },
              },
            ]),
            intro('gallery', { fr: 'Galerie', en: 'Gallery' }),
          ],
        },
        {
          label: { fr: 'Contact', en: 'Contact' },
          fields: [intro('contact', { fr: 'Contact', en: 'Contact' })],
        },
      ],
    },
  ],
}
