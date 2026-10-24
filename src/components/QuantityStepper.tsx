'use client'

type Props = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  labels: { group: string; decrease: string; increase: string }
}

/** − 2 + control. 40px buttons so it is easy to tap on a phone. */
export function QuantityStepper({ value, onChange, min = 1, max = 20, disabled, labels }: Props) {
  return (
    <div className="stepper" role="group" aria-label={labels.group}>
      <button
        type="button"
        className="stepper__button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label={labels.decrease}
      >
        −
      </button>
      <span className="stepper__value" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="stepper__button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label={labels.increase}
      >
        +
      </button>
    </div>
  )
}
