import type { Field, FieldHook } from 'payload'

/** "Vanille de Madagascar" -> "vanille-de-madagascar" */
export const slugify = (value: string): string =>
  value
    .normalize('NFD')
    // strip accents so "é" becomes "e" and the URL stays readable
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const formatSlug =
  (sourceField: string): FieldHook =>
  ({ data, originalDoc, value }) => {
    if (typeof value === 'string' && value.trim().length > 0) {
      return slugify(value)
    }

    // Nothing typed in: build the address from the title of this same locale,
    // so the French page gets a French address and the English one an English
    // address.
    const fallback = data?.[sourceField] ?? originalDoc?.[sourceField]

    if (typeof fallback === 'string' && fallback.trim().length > 0) {
      return slugify(fallback)
    }

    return value
  }

/**
 * Web address for a document, one per language.
 * Left empty it fills itself in from the title.
 */
export const slugField = (sourceField = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  localized: true,
  index: true,
  label: { fr: 'Adresse web (slug)', en: 'Web address (slug)' },
  admin: {
    position: 'sidebar',
    description: {
      fr: 'Laissez vide pour le générer depuis le titre. Différent pour chaque langue.',
      en: 'Leave empty to generate it from the title. Separate for each language.',
    },
  },
  hooks: {
    beforeValidate: [formatSlug(sourceField)],
  },
})
