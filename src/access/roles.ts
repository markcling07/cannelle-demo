import type { Access, FieldAccess } from 'payload'

export type Role = 'admin' | 'editor'

type MaybeUser = { roles?: Role[] | null } | null | undefined

const hasRole = (user: MaybeUser, role: Role): boolean =>
  Array.isArray(user?.roles) && user.roles.includes(role)

/** Signed in at all. */
export const isLoggedIn: Access = ({ req: { user } }) => Boolean(user)

/** Full control, including managing other people's accounts. */
export const isAdmin: Access = ({ req: { user } }) => hasRole(user as MaybeUser, 'admin')

/**
 * Day-to-day content work: products, categories, photographs.
 * This is the level Célestin and Heide get — everything they need to run
 * the catalogue, and nothing that can break the site or its accounts.
 */
export const isAdminOrEditor: Access = ({ req: { user } }) =>
  hasRole(user as MaybeUser, 'admin') || hasRole(user as MaybeUser, 'editor')

/** Admins see every account; everyone else sees only their own. */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (hasRole(user as MaybeUser, 'admin')) return true
  return { id: { equals: user.id } }
}

/** Used on the `roles` field so an editor cannot promote themselves. */
export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) =>
  hasRole(user as MaybeUser, 'admin')
