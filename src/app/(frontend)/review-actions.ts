'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export type ReviewStatus = 'idle' | 'ok' | 'invalid' | 'error'

export type ReviewState = { status: ReviewStatus }

/**
 * Saves a review from the product page as "pending". It only appears on the
 * site once a member of staff approves it in the admin panel.
 */
export async function submitReview(
  _previous: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  // A field people never see: anything filled in here came from a bot.
  // Answer as if it worked so the bot learns nothing.
  if (String(formData.get('website') ?? '').trim()) return { status: 'ok' }

  const productId = Number(formData.get('productId'))
  const name = String(formData.get('name') ?? '').trim()
  const comment = String(formData.get('comment') ?? '').trim()
  const rating = Number(formData.get('rating'))
  const language = String(formData.get('locale') ?? 'fr') === 'en' ? 'en' : 'fr'

  if (
    !Number.isInteger(productId) ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    name.length < 2 ||
    name.length > 60 ||
    comment.length < 10 ||
    comment.length > 1000
  ) {
    return { status: 'invalid' }
  }

  try {
    const payload = await getPayload({ config })

    // Only published products can be reviewed.
    const product = await payload
      .findByID({ collection: 'products', id: productId, depth: 0, draft: false, overrideAccess: false })
      .catch(() => null)

    if (!product || product._status !== 'published') return { status: 'invalid' }

    await payload.create({
      collection: 'reviews',
      data: { product: productId, name, rating, comment, language, status: 'pending' },
    })

    return { status: 'ok' }
  } catch {
    return { status: 'error' }
  }
}
