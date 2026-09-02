interface NumberStepperProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  disabled?: boolean
  onChange: (value: number) => void
}

const stepButton =
  'grid size-11 shrink-0 place-items-center rounded-full text-xl leading-none transition-colors'

export function NumberStepper({
  id,
  label,
  value,
  min,
  max,
  disabled,
  onChange,
}: NumberStepperProps) {
  const canDecrement = !disabled && value > min
  const canIncrement = !disabled && value < max

  function step(delta: number) {
    onChange(Math.min(max, Math.max(min, value + delta)))
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <label htmlFor={id} className="text-sm text-ink-muted">
        {label}
      </label>
      <div
        className={`flex h-14 items-center justify-between rounded-xl border px-2 transition-colors md:h-13 ${
          disabled
            ? 'border-track bg-muted'
            : 'border-line bg-base focus-within:border-accent hover:border-line-hover'
        }`}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          disabled={!canDecrement}
          onClick={() => step(-1)}
          className={`${stepButton} ${
            canDecrement
              ? 'text-ink-faint hover:bg-muted active:bg-track'
              : 'cursor-not-allowed text-leader'
          }`}
        >
          −
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(event) => {
            const next = Number(event.target.value)
            if (Number.isFinite(next)) onChange(next)
          }}
          onBlur={() => onChange(Math.min(max, Math.max(min, value || min)))}
          className="stepper-input w-full min-w-0 bg-transparent text-center font-display text-[30px] leading-none text-ink tnum focus-visible:outline-none disabled:text-ink-faint"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          disabled={!canIncrement}
          onClick={() => step(1)}
          className={`${stepButton} ${
            canIncrement
              ? 'text-ink hover:bg-muted active:bg-track'
              : 'cursor-not-allowed text-leader'
          }`}
        >
          +
        </button>
      </div>
    </div>
  )
}
