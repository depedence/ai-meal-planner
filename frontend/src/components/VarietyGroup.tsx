import { useRef } from 'react'
import type { KeyboardEvent } from 'react'
import type { VarietyLevel } from '../api/mealPlan'

interface Option {
  value: VarietyLevel
  label: string
  /** Свой оттенок из палитры на каждый вариант — акцент, зелёный статус, тёмный ink. */
  selected: string
  dot: string
}

const OPTIONS: Option[] = [
  {
    value: 'SAME',
    label: 'Одно и то же каждый день',
    selected: 'border-success bg-success-soft text-ink',
    dot: 'bg-success',
  },
  {
    value: 'MIXED',
    label: 'Среднее',
    selected: 'border-accent bg-accent-soft text-ink',
    dot: 'bg-accent',
  },
  {
    value: 'DIFFERENT',
    label: 'Каждый день разное',
    selected: 'border-ink bg-muted text-ink',
    dot: 'bg-ink',
  },
]

interface VarietyGroupProps {
  value: VarietyLevel
  onChange: (value: VarietyLevel) => void
  disabled?: boolean
}

export function VarietyGroup({ value, onChange, disabled }: VarietyGroupProps) {
  // Roving tabindex: у невыбранных вариантов tabIndex -1, поэтому после стрелки
  // фокус нужно перенести руками — иначе он остаётся на прежней кнопке.
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const delta =
      event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
          ? -1
          : 0
    if (!delta || disabled) return
    event.preventDefault()
    const index = OPTIONS.findIndex((option) => option.value === value)
    const next = (index + delta + OPTIONS.length) % OPTIONS.length
    onChange(OPTIONS[next].value)
    buttons.current[next]?.focus()
  }

  return (
    <div className="flex flex-col gap-2">
      <span id="variety-label" className="text-sm text-ink-muted">
        Разнообразие
      </span>
      <div
        role="radiogroup"
        aria-labelledby="variety-label"
        onKeyDown={handleKeyDown}
        className="flex flex-col gap-2"
      >
        {OPTIONS.map((option, index) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              ref={(element) => {
                buttons.current[index] = element
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={`flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-[15px] transition-all duration-150 md:min-h-13 ${
                disabled ? 'cursor-not-allowed opacity-50' : ''
              } ${
                selected
                  ? `${option.selected} font-semibold`
                  : 'border-line bg-base text-ink-muted enabled:hover:bg-muted enabled:active:bg-track'
              }`}
            >
              <span
                aria-hidden="true"
                className={`size-2.5 shrink-0 rounded-full transition-all duration-150 ${
                  selected ? `${option.dot} scale-125` : 'bg-line'
                }`}
              />
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
