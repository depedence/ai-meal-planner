import { useEffect, useRef, useState } from 'react'
import { formatMoney } from '../lib/format'
import { BUDGET_MAX, BUDGET_MIN, BUDGET_STEP, clamp } from '../lib/limits'

interface BudgetSliderProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function BudgetSlider({ value, onChange, disabled }: BudgetSliderProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  // Центр ручки ходит в пределах [12px, ширина − 12px], поэтому заливку считаем
  // в тех же координатах — иначе её край отстаёт от ручки на краях диапазона.
  const ratio =
    (clamp(value, BUDGET_MIN, BUDGET_MAX) - BUDGET_MIN) /
    (BUDGET_MAX - BUDGET_MIN)
  const filledWidth = `calc(12px + (100% - 24px) * ${ratio})`

  function commitDraft() {
    // Пустой или нечисловой ввод откатывается к прежнему значению.
    const digits = draft.replace(/\D/g, '').slice(0, 9)
    const parsed = digits ? Number(digits) : NaN
    if (Number.isFinite(parsed) && parsed > 0) {
      const clamped = clamp(parsed, BUDGET_MIN, BUDGET_MAX)
      onChange(Math.round(clamped / BUDGET_STEP) * BUDGET_STEP)
    }
    setEditing(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor="budget" className="text-sm text-ink-muted">
          Бюджет
        </label>
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitDraft}
            onKeyDown={(event) => {
              // Enter в текстовом поле внутри <form> иначе отправит форму
              // и потратит запрос к Groq вместо простого подтверждения ввода.
              if (event.key === 'Enter') {
                event.preventDefault()
                commitDraft()
              }
              if (event.key === 'Escape') setEditing(false)
            }}
            aria-label="Бюджет в рублях"
            className="w-40 rounded-xl border border-accent bg-surface px-3 py-1 text-right font-display text-[32px] leading-none text-accent tnum focus-visible:outline-none md:text-[42px]"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(String(value))
              setEditing(true)
            }}
            disabled={disabled}
            aria-label={`Бюджет ${value} рублей, нажмите чтобы ввести вручную`}
            className={`rounded-xl px-1 font-display text-[32px] leading-none tnum transition-colors md:text-[42px] ${
              disabled ? 'text-ink-faint' : 'text-accent hover:text-accent-ink'
            }`}
          >
            {formatMoney(value)}
          </button>
        )}
      </div>

      <div className="relative flex h-6 items-center">
        <div className="pointer-events-none absolute inset-x-0 h-2 rounded-full bg-track">
          {/* Без transition: заливка должна двигаться ровно с ручкой */}
          <div
            className={`h-full rounded-full ${disabled ? 'bg-leader' : 'bg-accent'}`}
            style={{ width: filledWidth }}
          />
        </div>
        <input
          id="budget"
          type="range"
          min={BUDGET_MIN}
          max={BUDGET_MAX}
          step={BUDGET_STEP}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
          className="budget-range relative w-full appearance-none bg-transparent focus-visible:outline-none disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex justify-between text-xs text-ink-faint tnum">
        <span>{formatMoney(BUDGET_MIN)}</span>
        <span>{formatMoney(BUDGET_MAX)}</span>
      </div>
    </div>
  )
}
