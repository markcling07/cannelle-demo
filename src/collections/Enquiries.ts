import type { CollectionConfig } from 'payload'

import { ADMIN_GROUPS } from '../adminGroups'
import { isAdmin, isAdminOrEditor } from '../access/roles'

export const ENQUIRY_TYPES = ['quote', 'commercial', 'partnership', 'other'] as const

export type EnquiryType = (typeof ENQUIRY_TYPES)[number]

/**
 * Requests sent from the contact form and the "Request a quotation" buttons.
 *
 * Visitors never write here directly: the site's server action validates the
 * form and creates the entry. Staff read them and track their progress. No
 * email is sent — there is no mail service connected to the demonstration.
 */
export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  labels: {
    singular: { fr: 'Demande', en: 'Enquiry' },
    plural: { fr: 'Demandes reçues', en: 'Enquiries' },
  },

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'product', 'status', 'createdAt'],
    group: ADMIN_GROUPS.enquiries,
    description: {
      fr: 'Les demandes envoyées depuis le site : devis, demandes commerciales, partenariats.',
      en: 'Requests sent from the site: quotations, commercial enquiries, partnerships.',
    },
  },

  defaultSort: '-createdAt',

  access: {
    read: isAdminOrEditor,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    // Personal data: only an administrator may erase it, e.g. on request.
    delete: isAdmin,
  },

  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'commercial',
          label: { fr: 'Objet', en: 'Type' },
          admin: { width: '50%' },
          options: [
            { value: 'quote', label: { fr: 'Demande de devis', en: 'Quotation request' } },
            { value: 'commercial', label: { fr: 'Demande commerciale', en: 'Commercial enquiry' } },
            { value: 'partnership', label: { fr: 'Partenariat', en: 'Partnership' } },
            { value: 'other', label: { fr: 'Autre', en: 'Other' } },
          ],
        },
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          label: { fr: 'Produit', en: 'Product' },
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, label: { fr: 'Nom', en: 'Name' }, admin: { width: '50%' } },
        { name: 'company', type: 'text', label: { fr: 'Société', en: 'Company' }, admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', required: true, label: { fr: 'Courriel', en: 'Email' }, admin: { width: '50%' } },
        { name: 'phone', type: 'text', label: { fr: 'Téléphone', en: 'Phone' }, admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'country', type: 'text', label: { fr: 'Pays', en: 'Country' }, admin: { width: '50%' } },
        { name: 'volume', type: 'text', label: { fr: 'Volume estimé', en: 'Estimated volume' }, admin: { width: '50%' } },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      label: { fr: 'Message', en: 'Message' },
    },

    // --- staff side --------------------------------------------------------
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      label: { fr: 'Suivi', en: 'Status' },
      options: [
        { value: 'new', label: { fr: 'Nouvelle', en: 'New' } },
        { value: 'in-progress', label: { fr: 'En cours', en: 'In progress' } },
        { value: 'closed', label: { fr: 'Traitée', en: 'Closed' } },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: { fr: 'Notes internes', en: 'Internal notes' },
      admin: {
        position: 'sidebar',
        description: { fr: 'Jamais visibles sur le site.', en: 'Never shown on the site.' },
      },
    },
    {
      name: 'language',
      type: 'select',
      label: { fr: 'Langue', en: 'Language' },
      options: [
        { label: 'Français', value: 'fr' },
        { label: 'English', value: 'en' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'consentAt',
      type: 'date',
      label: { fr: 'Consentement donné le', en: 'Consent given on' },
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
  ],
}
