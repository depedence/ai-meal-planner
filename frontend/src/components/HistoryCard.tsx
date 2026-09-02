import { useId, useMemo, useState } from 'react'
import { formatMoney, plural } from '../lib/format'
import type { PlanEntry } from '../lib/history'
import { MEAL_TITLES, groupMealsByDay } from '../lib/meals'
import { Chevron } from './Chevron'

interface HistoryCardProps {
  entry: PlanEntry
  number: number
  onOpen: () => void
}

/**
 * Карточка сохранённого варианта: в свёрнутом виде — параметры и сумма,
 * в раскрытом — выжимка по дням (только названия блюд), чтобы выбрать
 * подходящий план, не открывая подробный экран.
 */
export function HistoryCard({ entry, number, onOpen }: HistoryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const panelId = useId()
  const { params, plan } = entry
  const days = useMemo(() => groupMealsByDay(plan.meals), [plan.meals])

  return (
    <article
      className={`rounded-2xl border bg-surface transition-colors duration-200 ${
        expanded ? 'border-accent' : 'border-line hover:border-line-hover'
      }`}
    >
      <h3>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((open) => !open)}
          className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left"
        >
          <span className="min-w-0 flex-1 text-sm text-ink-muted tnum">
            <span className="font-semibold text-ink">Вариант {number}</span> ·{' '}
            {params.days} {plural(params.days, 'день', 'дня', 'дней')} ·{' '}
            {params.peopleCount}{' '}
            {plural(params.peopleCount, 'человек', 'человека', 'человек')}
          </span>
          <span className="shrink-0 font-semibold text-accent tnum">
            {formatMoney(plan.totalEstimatedPrice)}
          </span>
          <Chevron
            expanded={expanded}
            className={
              expanded ? 'text-accent' : 'text-ink-faint group-hover:text-ink'
            }
          />
        </button>
      </h3>

      {/* grid-rows 0fr -> 1fr даёт плавную анимацию до высоты по содержимому */}
      <div
        id={panelId}
        inert={!expanded}
        className="grid transition-[grid-template-rows] duration-[220ms] ease-out"
        style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div
            className={`flex flex-col gap-3.5 border-t border-track px-4 py-3.5 transition-opacity duration-150 ${
              expanded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {days.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {days.map((day, index) => (
                  <li
                    key={day.dayNumber}
                    className={`flex min-w-0 flex-col gap-1 ${
                      expanded ? 'animate-meal-in' : ''
                    }`}
                    style={{ animationDelay: `${index * 45}ms` }}
                  >
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-ink-faint uppercase">
                      День {day.dayNumber}
                    </p>
                    {day.meals.map((meal, mealIndex) => (
                      <p
                        key={`${meal.type}-${mealIndex}`}
                        className="flex min-w-0 gap-2 text-[13px] leading-snug"
                      >
                        <span className="w-[52px] shrink-0 text-ink-faint">
                          {MEAL_TITLES[meal.type] ?? meal.type}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-ink-muted">
                          {meal.dishName}
                        </span>
                      </p>
                    ))}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-soft">В этом плане нет дней.</p>
            )}

            <button
              type="button"
              onClick={onOpen}
              className="self-start rounded-xl border border-ink px-5 py-2 text-[13px] font-semibold text-ink transition-colors duration-150 hover:bg-muted active:bg-track"
            >
              Открыть план
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
