import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { DEFAULT_LOCALE } from '@/lib/locale'

/**
 * The public site lives under /fr and /en. A visitor arriving at the bare
 * domain lands on the News page, in French, the default language. The
 * institutional home page stays at /fr and /en, one click away on the logo.
 *
 * The redirect is temporary (307), so browsers do not remember it and the
 * landing page can be changed later without visitors being stuck on the old
 * one.
 *
 * The matcher below deliberately covers the site root only, so the admin
 * panel (/admin) and the API (/api) are never touched.
 */
export default function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}/news`, request.url))
}

export const config = {
  matcher: '/',
}
