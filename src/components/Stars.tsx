/**
 * Five stars filled to the rating, including fractions (4.6 fills 92%).
 * One accessible name for the whole group; the glyphs themselves are hidden.
 */
export function Stars({
  value,
  label,
  size = 'md',
}: {
  value: number
  label: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const filled = (Math.max(0, Math.min(5, value)) / 5) * 100

  return (
    <span className={`stars stars--${size}`} role="img" aria-label={label}>
      <span className="stars__base" aria-hidden="true">
        ★★★★★
      </span>
      <span className="stars__fill" style={{ width: `${filled}%` }} aria-hidden="true">
        ★★★★★
      </span>
    </span>
  )
}
