/**
 * The site's public address, without a trailing slash. Social networks need
 * full addresses for share cards, and the admin needs one for media links.
 *
 * Set NEXT_PUBLIC_SERVER_URL once the Group has its own domain. Until then
 * the Vercel production address is used, or localhost in development.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')
).replace(/\/+$/, '')
