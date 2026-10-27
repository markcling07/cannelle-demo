'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

import { ENQUIRY_TYPES, type EnquiryType } from '@/collections/Enquiries'

export type EnquiryField = 'name' | 'email' | 'message' | 'consent'
export type EnquiryError = 'required' | 'email' | 'consent'

export type EnquiryState = {
  status: 'idle' | 'ok' | 'invalid' | 'error'
  errors?: Partial<Record<EnquiryField, EnquiryError>>
  /** What was typed, so a failed submission does not empty the form. */
  values?: Record<string, string>
}

// Same deliberately simple check as the newsletter form.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const TEXT_FIELDS = ['type', 'name', 'company', 'email', 'phone', 'country', 'product', 'volume', 'message'] as const

const clip = (value: FormDataEntryValue | null, max: number): string =>
  String(value ?? '')
    .trim()
    .slice(0, max)

/**
 * Saves a request from the contact form as an Enquiry for the team to follow
 * up in the administration area. No email is sent.
 */
export async function submitEnquiry(
  _previous: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  // A field people never see: anything filled in came from a bot. Answer as
  // if it worked so the bot learns nothing.
  if (clip(formData.get('website'), 200)) return { status: 'ok' }

  const values = Object.fromEntries(
    TEXT_FIELDS.map((field) => [field, clip(formData.get(field), field === 'message' ? 4000 : 200)]),
  ) as Record<(typeof TEXT_FIELDS)[number], string>

  const consent = formData.get('consent') === 'on'
  const language = formData.get('locale') === 'en' ? 'en' : 'fr'
  const type: EnquiryType = (ENQUIRY_TYPES as readonly string[]).includes(values.type)
    ? (values.type as EnquiryType)
    : 'commercial'

  const errors: EnquiryState['errors'] = {}
  if (values.name.length < 2) errors.name = 'required'
  if (!values.email) errors.email = 'required'
  else if (!EMAIL.test(values.email)) errors.email = 'email'
  if (values.message.length < 2) errors.message = 'required'
  if (!consent) errors.consent = 'consent'

  if (Object.keys(errors).length > 0) return { status: 'invalid', errors, values }

  try {
    const payload = await getPayload({ config })

    // Only a published product can be named in an enquiry.
    const productId = Number(values.product)
    const product =
      Number.isInteger(productId) && productId > 0
        ? await payload
            .findByID({ collection: 'products', id: productId, depth: 0, draft: false, overrideAccess: false })
            .catch(() => null)
        : null

    await payload.create({
      collection: 'enquiries',
      data: {
        type,
        name: values.name,
        company: values.company || undefined,
        email: values.email.toLowerCase(),
        phone: values.phone || undefined,
        country: values.country || undefined,
        product: product?.id,
        volume: values.volume || undefined,
        message: values.message,
        language,
        status: 'new',
        consentAt: new Date().toISOString(),
      },
    })

    return { status: 'ok' }
  } catch {
    return { status: 'error', values }
  }
}
