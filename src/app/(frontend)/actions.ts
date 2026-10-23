'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export type SubscribeStatus = 'idle' | 'ok' | 'exists' | 'invalid' | 'error'

export type SubscribeState = { status: SubscribeStatus }

// Deliberately simple: one @, a dot in the domain, no spaces. Anything that
// gets past this is still validated by the collection's own email field.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function subscribe(
  _previous: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const locale = String(formData.get('locale') ?? 'fr') === 'en' ? 'en' : 'fr'

  if (!EMAIL.test(email)) return { status: 'invalid' }

  try {
    const payload = await getPayload({ config })

    const existing = await payload.find({
      collection: 'subscribers',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
    })

    if (existing.totalDocs > 0) return { status: 'exists' }

    await payload.create({
      collection: 'subscribers',
      data: { email, locale },
    })

    return { status: 'ok' }
  } catch (error) {
    // A duplicate can still slip through between the check and the insert;
    // the unique index catches it and we report it as already subscribed.
    if (error instanceof Error && /unique|duplicate/i.test(error.message)) {
      return { status: 'exists' }
    }
    return { status: 'error' }
  }
}
