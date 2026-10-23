import type sharpType from 'sharp'

const WIDTH = 1600
const HEIGHT = 1000
const AVATAR = 400

const escapeXml = (value: string): string =>
  value.replace(
    /[<>&'"]/g,
    (char) =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char] as string,
  )

const FONT = 'Segoe UI, DejaVu Sans, Helvetica, Arial, sans-serif'

/**
 * Builds a sample photograph so the catalogue is not full of empty boxes.
 * These are generated placeholders, not real product photography — the point
 * of the demonstration is that the client replaces them from the admin panel.
 */
export const placeholderImage = async (
  sharp: typeof sharpType,
  label: string,
  [from, to]: [string, string],
): Promise<Buffer> => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.72" cy="0.26" r="0.62">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.24"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>

  <circle cx="1250" cy="235" r="165" fill="#ffffff" fill-opacity="0.08"/>
  <circle cx="300" cy="820" r="120" fill="#ffffff" fill-opacity="0.05"/>

  <!-- Centred, so the label survives the square and 4:3 crops Payload
       generates for the catalogue cards and thumbnails. -->
  <rect x="${WIDTH / 2 - 48}" y="${HEIGHT / 2 - 150}" width="96" height="6" rx="3"
        fill="#ffffff" fill-opacity="0.75"/>

  <text x="${WIDTH / 2}" y="${HEIGHT / 2 - 20}" text-anchor="middle" font-family="${FONT}"
        font-size="96" font-weight="700" fill="#ffffff">${escapeXml(label)}</text>
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 + 56}" text-anchor="middle" font-family="${FONT}"
        font-size="36" fill="#ffffff" fill-opacity="0.78">Image de démonstration / Sample image</text>
</svg>`

  return sharp(Buffer.from(svg)).jpeg({ quality: 86, mozjpeg: true }).toBuffer()
}

/** A flat square with the author's initials, used for the journal bylines. */
export const avatarImage = async (
  sharp: typeof sharpType,
  initials: string,
  background: string,
): Promise<Buffer> => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${AVATAR}" height="${AVATAR}">
  <rect width="${AVATAR}" height="${AVATAR}" fill="${background}"/>
  <text x="${AVATAR / 2}" y="${AVATAR / 2 + 56}" text-anchor="middle" font-family="${FONT}"
        font-size="160" font-weight="600" fill="#ffffff">${escapeXml(initials)}</text>
</svg>`

  return sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toBuffer()
}
