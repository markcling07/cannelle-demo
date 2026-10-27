/** The round arrow at the end of a pill button. */
export function Arrow({ down = false }: { down?: boolean }) {
  return (
    <span className="btn-arrow__icon" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="12" height="12">
        <path
          d={down ? 'M8 3v10M3.5 8.5 8 13l4.5-4.5' : 'M3 8h10M8.5 3.5 13 8l-4.5 4.5'}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
