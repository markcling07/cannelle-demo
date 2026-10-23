import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { DEFAULT_LOCALE } from '@/lib/locale'

/**
 * The public site lives under /fr and /en. A visitor arriving at the bare
 * domain is sent to the French version, which is the default language.
 *
 * The matcher below deliberately covers the site root only, so the admin
 * panel (/admin) and the API (/api) are never touched.
 */
export default function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}`, request.url))
}

export const config = {
  matcher: '/',
}
