import { useId, useState } from 'react'
import { formatMoney } from '../lib/format'
import type { DayPlan } from '../lib/meals'
import { Chevron } from './Chevron'
import { MealBlock } from './MealBlock'

interface DayCardProps {
  day: DayPlan
  defaultExpanded?: boolean
}

export function DayCard({ day, defaultExpanded = false }: DayCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const panelId = useId()
  const meals = day.meals
  const dayTotal = meals.reduce((sum, meal) => sum + meal.estimatedPrice, 0)

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
          className="group flex w-full items-center justify-between gap-4 rounded-2xl px-4.5 py-4 text-left md:px-7.5 md:py-5"
        >
          <span className="font-display text-[20px] leading-tight text-ink md:text-[26px]">
            День {day.dayNumber}
          </span>
          <span className="flex shrink-0 items-center gap-3.5">
            <span
              className={`text-sm transition-colors duration-200 tnum ${
                expanded ? 'font-semibold text-accent' : 'text-ink-muted'
              }`}
            >
              {formatMoney(dayTotal)}
            </span>
            <Chevron
              expanded={expanded}
              className={
                expanded ? 'text-accent' : 'text-ink-faint group-hover:text-ink'
              }
            />
          </span>
        </button>
      </h3>

      {meals.length > 0 && (
        <p
          className={`hidden truncate px-7.5 text-[13px] text-ink-soft transition-all duration-200 print:hidden md:block ${
            expanded ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-8 pb-5 opacity-100'
          }`}
        >
          {meals.map((meal) => meal.dishName).join(' · ')}
        </p>
      )}

      {/* grid-rows 0fr -> 1fr даёт плавную анимацию до высоты по содержимому.
          print-expand раскрывает свёрнутый день на печати: на бумаге плана
          должно быть видно всё, независимо от того, что открыто на экране. */}
      <div
        id={panelId}
        inert={!expanded}
        className="print-expand grid transition-[grid-template-rows] duration-[220ms] ease-out"
        style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div
            className={`border-t border-track px-4.5 py-4 transition-opacity duration-150 md:px-7.5 md:py-6 ${
              expanded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {meals.length > 0 ? (
              <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                {meals.map((meal, index) => (
                  <div
                    key={`${meal.type}-${index}`}
                    className={`print-keep ${expanded ? 'animate-meal-in' : ''}`}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <MealBlock meal={meal} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-soft">Для этого дня блюд нет.</p>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
