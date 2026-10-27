import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import sharp from 'sharp'

import type { Media, SectionIntro } from '@/payload-types'
import { getGlobal } from '@/lib/content'
import { DEFAULT_LOCALE, isLocale, t, type Locale } from '@/lib/locale'
import { asMedia, bestUrl, type MediaRef } from '@/lib/media'
import { SITE_URL } from '@/lib/siteUrl'

/**
 * Share cards: the picture WhatsApp, Facebook, LinkedIn or X show when someone
 * shares a link to the site. Each page has an `opengraph-image.tsx` beside it
 * that picks a title, a short text and a photo, and `renderShareCard` draws
 * them on the Group's green with the logo and the site's address.
 *
 * Cards are drawn when a network asks for them, so a change made in the
 * administration area shows on the next share. Networks keep their own copy
 * for a while; Facebook's Sharing Debugger fetches a fresh one on demand.
 */

/** The size every network expects. */
export const SHARE_CARD_SIZE = { width: 1200, height: 630 }
export const SHARE_CARD_TYPE = 'image/jpeg'

export type ShareCardContent = {
  eyebrow?: string | null
  title?: string | null
  text?: string | null
  image?: MediaRef
}

const GREEN = '#15301b'
const PAPER = '#fffdf8'
// --gold, lightened so small text stays legible on the green.
const GOLD = '#cfa45a'

const PHOTO = { width: 760, height: 630 }
const SEAL = 400
const TEXT_WIDTH = 560

// Read once per server instance. The renderer cannot read the WOFF2 files the
// site uses, so the same two typefaces are kept as WOFF in src/assets/fonts.
let fonts: ReturnType<typeof loadFonts> | null = null

function loadFonts() {
  return Promise.all([
    readFile(path.join(process.cwd(), 'src/assets/fonts/cormorant-garamond-latin-600-normal.woff')),
    readFile(path.join(process.cwd(), 'src/assets/fonts/inter-latin-400-normal.woff')),
    readFile(path.join(process.cwd(), 'src/assets/fonts/inter-latin-600-normal.woff')),
  ]).then(([serif, sans, sansBold]) => [
    { name: 'Cormorant Garamond', data: serif, weight: 600 as const, style: 'normal' as const },
    { name: 'Inter', data: sans, weight: 400 as const, style: 'normal' as const },
    { name: 'Inter', data: sansBold, weight: 600 as const, style: 'normal' as const },
  ])
}

/**
 * Photos are stored as WebP, which the renderer cannot read either: fetch
 * one, fit it to the space it takes on the card and pass it on as JPEG.
 * A missing or unreachable photo gives a card without one.
 */
async function loadImage(
  media: Media | null,
  sizeName: 'thumbnail' | 'hero',
  width: number,
  height: number,
  fit: 'cover' | 'contain',
): Promise<string | null> {
  const src = media ? bestUrl(media, sizeName) : ''
  if (!src) return null

  try {
    const response = await fetch(new URL(src, SITE_URL), { signal: AbortSignal.timeout(8000) })
    if (!response.ok) return null

    const jpeg = await sharp(Buffer.from(await response.arrayBuffer()))
      .resize(width, height, { fit, background: '#ffffff' })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 85 })
      .toBuffer()

    return `data:image/jpeg;base64,${jpeg.toString('base64')}`
  } catch {
    return null
  }
}

/** Shortens text at a word boundary so it fits the lines the card gives it. */
const clamp = (text: string | null | undefined, max: number): string => {
  const clean = (text ?? '').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean

  const cut = clean.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:—–-]+$/, '')}…`
}

/** A title's length in lower-case letters: capitals take about a third more room. */
const titleLength = (title: string) =>
  [...title].reduce((length, char) => length + (char !== char.toLowerCase() ? 1.35 : 1), 0)

/** Long titles get a smaller size, so none runs past three lines. */
const titleSize = (length: number) => (length <= 26 ? 68 : length <= 44 ? 58 : 50)

/** The language in a card's address; an unknown one falls back to French. */
export const cardLocale = (raw: string): Locale => (isLocale(raw) ? raw : DEFAULT_LOCALE)

/**
 * Draws a card. Without a title it shows the site's name and tagline — the
 * card for a page that does not exist, or has not been translated yet.
 */
export async function renderShareCard(locale: Locale, content: ShareCardContent = {}) {
  const settings = await getGlobal('site-settings', locale)
  const siteName = settings?.siteName || 'GROUPE JAOVAZAHA'

  const title = clamp(content.title || siteName, 90)
  const length = titleLength(title)
  // Under a long title the text gets two lines instead of three.
  const text = clamp(content.title ? content.text : settings?.tagline, length > 44 ? 90 : 130)
  const eyebrow = clamp(content.eyebrow, 48)

  const [fontData, photo, logo] = await Promise.all([
    (fonts ??= loadFonts()),
    loadImage(asMedia(content.image), 'hero', PHOTO.width, PHOTO.height, 'cover'),
    loadImage(asMedia(settings?.logo), 'thumbnail', 280, 280, 'contain'),
  ])

  // With a photo, the logo sits small beside the name. Without one, it
  // fills the right-hand side as a seal.
  const seal = !photo && logo

  const png = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: GREEN,
          color: PAPER,
          fontFamily: 'Inter',
        }}
      >
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          <img
            src={photo}
            width={PHOTO.width}
            height={PHOTO.height}
            style={{ position: 'absolute', top: 0, right: 0 }}
          />
        )}
        {photo && (
          // The green fades into the photo, so the text never sits on it.
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: SHARE_CARD_SIZE.width - PHOTO.width,
              width: 440,
              height: '100%',
              backgroundImage: `linear-gradient(90deg, ${GREEN} 0%, rgba(21, 48, 27, 0.82) 40%, rgba(21, 48, 27, 0) 100%)`,
            }}
          />
        )}
        {seal && (
          <div
            style={{
              position: 'absolute',
              top: (SHARE_CARD_SIZE.height - SEAL) / 2,
              right: 88,
              width: SEAL,
              height: SEAL,
              borderRadius: SEAL / 2,
              backgroundColor: '#ffffff',
              border: `4px solid ${GOLD}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img src={logo} width={280} height={280} />
          </div>
        )}

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '60px 0 56px 72px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {logo && !seal && (
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 18,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img src={logo} width={46} height={46} />
              </div>
            )}
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase' }}>
              {siteName}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flexGrow: 1,
              width: TEXT_WIDTH,
              padding: '28px 0',
            }}
          >
            {eyebrow && (
              <div
                style={{
                  color: GOLD,
                  fontSize: 19,
                  fontWeight: 600,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                  marginBottom: 18,
                }}
              >
                {eyebrow}
              </div>
            )}
            <div
              style={{
                fontFamily: 'Cormorant Garamond',
                fontWeight: 600,
                fontSize: titleSize(length),
                lineHeight: 1.05,
              }}
            >
              {title}
            </div>
            {text && (
              <div style={{ fontSize: 24, lineHeight: 1.45, opacity: 0.82, marginTop: 24 }}>{text}</div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 40, height: 2, backgroundColor: GOLD, marginRight: 16 }} />
            <div style={{ fontSize: 18, opacity: 0.72 }}>{new URL(SITE_URL).host}</div>
          </div>
        </div>
      </div>
    ),
    { ...SHARE_CARD_SIZE, fonts: fontData },
  )

  // The renderer only writes PNG, about 1 MB with a photo. WhatsApp drops
  // preview images much over 300 KB, so the card is sent as JPEG instead.
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer()

  return new Response(new Uint8Array(jpeg), {
    headers: {
      'content-type': SHARE_CARD_TYPE,
      // Kept for an hour, then redrawn in the background, so edits made in
      // the admin reach new shares within the hour.
      'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}

type Section = Exclude<keyof SectionIntro, 'id' | 'updatedAt' | 'createdAt'>

/** A list page's card: the title and introduction set in "Section introductions". */
export async function renderSectionCard(raw: string, section: Section) {
  const locale = cardLocale(raw)
  const intros = await getGlobal('section-intros', locale, 0)
  const intro = intros[section]

  return renderShareCard(locale, {
    title: intro?.title || t(section, locale),
    text: intro?.intro,
  })
}
