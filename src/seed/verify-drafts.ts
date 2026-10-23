/**
 * Checks that an unpublished product is genuinely invisible to a visitor,
 * rather than merely hidden in the interface.
 *
 *   npx payload run src/seed/verify-drafts.ts
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

// `overrideAccess: false` with no user is exactly what a visitor gets.
const asPublic = () =>
  payload.find({
    collection: 'products',
    locale: 'fr',
    overrideAccess: false,
    user: null,
    draft: false,
    limit: 100,
    depth: 0,
  })

const before = await asPublic()
console.log(`visible to the public before: ${before.totalDocs}`)

const target = before.docs[0]
if (!target) throw new Error('No published product to test with. Run `npm run seed` first.')

await payload.update({
  collection: 'products',
  id: target.id,
  data: { _status: 'draft' },
})
console.log(`unpublished: ${target.title}`)

const during = await asPublic()
console.log(`visible to the public while unpublished: ${during.totalDocs}`)

const stillListed = during.docs.some((doc) => doc.id === target.id)

await payload.update({
  collection: 'products',
  id: target.id,
  data: { _status: 'published' },
})
console.log(`republished: ${target.title}`)

const after = await asPublic()
console.log(`visible to the public after: ${after.totalDocs}`)

if (stillListed) {
  console.error('FAIL — an unpublished product was still returned to the public')
  process.exit(1)
}

if (after.totalDocs !== before.totalDocs) {
  console.error('FAIL — the catalogue did not return to its original state')
  process.exit(1)
}

console.log('PASS — unpublished products are hidden from visitors and restore cleanly')
process.exit(0)
