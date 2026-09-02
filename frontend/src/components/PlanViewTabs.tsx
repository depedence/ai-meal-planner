import { useRef } from 'react'
import type { KeyboardEvent } from 'react'
import type { PlanView } from '../lib/planView'
import { panelId, tabId } from '../lib/planView'

const VIEWS: { value: PlanView; label: string }[] = [
  { value: 'days', label: 'По дням' },
  { value: 'shopping', label: 'Список покупок' },
]

interface PlanViewTabsProps {
  value: PlanView
  onChange: (value: PlanView) => void
  /** Общий префикс id: связывает вкладку с её панелью в ResultScreen. */
  idPrefix: string
}

/** Переключатель между планом по дням и списком покупок. */
export function PlanViewTabs({ value, onChange, idPrefix }: PlanViewTabsProps) {
  // Roving tabindex: у невыбранной вкладки tabIndex -1, поэтому после стрелки
  // фокус нужно перенести руками — иначе он останется на прежней кнопке.
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const delta =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0
    if (!delta) return
    event.preventDefault()
    const index = VIEWS.findIndex((view) => view.value === value)
    const next = (index + delta + VIEWS.length) % VIEWS.length
    onChange(VIEWS[next].value)
    buttons.current[next]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label="Вид плана"
      onKeyDown={handleKeyDown}
      className="flex gap-2"
    >
      {VIEWS.map((view, index) => {
        const selected = view.value === value
        return (
          <button
            key={view.value}
            ref={(element) => {
              buttons.current[index] = element
            }}
            type="button"
            role="tab"
            id={tabId(idPrefix, view.value)}
            aria-selected={selected}
            aria-controls={panelId(idPrefix, view.value)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(view.value)}
            className={`min-h-11 rounded-xl border px-4 py-2.5 text-[15px] transition-all duration-150 ${
              selected
                ? 'border-accent bg-accent-soft font-semibold text-ink'
                : 'border-line bg-base text-ink-muted hover:bg-muted active:bg-track'
            }`}
          >
            {view.label}
          </button>
        )
      })}
    </div>
  )
}
