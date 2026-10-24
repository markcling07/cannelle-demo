import { getPayload } from 'payload'
import config from '@payload-config'

import type { Review } from '@/payload-types'

export type ReviewStats = {
  count: number
  average: number
  /** How many reviews gave 1, 2, 3, 4 and 5 stars, in that order. */
  distribution: [number, number, number, number, number]
}

const productIdOf = (review: Pick<Review, 'product'>): number =>
  typeof review.product === 'object' ? review.product.id : review.product

/**
 * Average rating and star breakdown for each product, from approved reviews
 * only. Products without any approved review are left out of the map.
 */
export const reviewStats = async (productIds: number[]): Promise<Map<number, ReviewStats>> => {
  const stats = new Map<number, ReviewStats>()
  if (productIds.length === 0) return stats

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'reviews',
    depth: 0,
    limit: 2000,
    overrideAccess: false,
    select: { product: true, rating: true },
    where: {
      and: [{ product: { in: productIds } }, { status: { equals: 'approved' } }],
    },
  })

  for (const review of docs) {
    const id = productIdOf(review)
    const rating = Math.min(5, Math.max(1, Math.round(review.rating)))
    const entry = stats.get(id) ?? { count: 0, average: 0, distribution: [0, 0, 0, 0, 0] }

    entry.distribution[rating - 1] += 1
    entry.count += 1
    stats.set(id, entry)
  }

  for (const entry of stats.values()) {
    const total = entry.distribution.reduce((sum, n, i) => sum + n * (i + 1), 0)
    entry.average = Math.round((total / entry.count) * 10) / 10
  }

  return stats
}

/** A product's approved reviews, newest first. */
export const approvedReviews = async (productId: number): Promise<Review[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'reviews',
    depth: 0,
    limit: 50,
    sort: '-createdAt',
    overrideAccess: false,
    where: {
      and: [{ product: { equals: productId } }, { status: { equals: 'approved' } }],
    },
  })

  return docs
}
