import { useMemo } from 'react'
import { plural } from '../lib/format'
import type { PlanEntry } from '../lib/history'
import { groupMealsByDay } from '../lib/meals'
import { Button } from './Button'
import { DayCard } from './DayCard'
import { DaySkeleton } from './DaySkeleton'
import { LoadingNote } from './LoadingNote'
import { Logo } from './Logo'
import { TotalPanel } from './TotalPanel'

interface ResultScreenProps {
  entry: PlanEntry
  position: number
  total: number
  loading: boolean
  error: string | null
  onPrev: () => void
  onNext: () => void
  onRetry: () => void
  onBack: () => void
}

const arrowButton =
  'grid size-11 place-items-center rounded-xl border text-lg leading-none transition-colors duration-150'

export function ResultScreen({
  entry,
  position,
  total,
  loading,
  error,
  onPrev,
  onNext,
  onRetry,
  onBack,
}: ResultScreenProps) {
  const { plan, params } = entry
  // Backend присылает плоский список приёмов пищи — дни собираем сами
  const days = useMemo(() => groupMealsByDay(plan.meals), [plan.meals])
  const hasPrev = position > 1
  const hasNext = position < total

  return (
    <div className="animate-screen-in mx-auto flex w-full max-w-[1344px] flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line px-5 py-4 lg:px-12 lg:py-5">
        <Logo />

        {total > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              disabled={!hasPrev || loading}
              aria-label="Предыдущий вариант"
              className={`${arrowButton} ${
                hasPrev && !loading
                  ? 'border-line text-ink hover:bg-muted active:bg-track'
                  : 'cursor-not-allowed border-track text-leader'
              }`}
            >
              ‹
            </button>
            <span className="text-[13px] text-ink-muted tnum">
              Вариант {position} из {total}
            </span>
            <button
              type="button"
              onClick={onNext}
              disabled={!hasNext || loading}
              aria-label="Следующий вариант"
              className={`${arrowButton} ${
                hasNext && !loading
                  ? 'border-line text-ink hover:bg-muted active:bg-track'
                  : 'cursor-not-allowed border-track text-leader'
              }`}
            >
              ›
            </button>
          </div>
        )}

        <p className="text-[13px] text-ink-soft tnum">
          {params.days} {plural(params.days, 'день', 'дня', 'дней')} ·{' '}
          {params.peopleCount}{' '}
          {plural(params.peopleCount, 'человек', 'человека', 'человек')}
        </p>
      </header>

      <main className="grid flex-1 grid-cols-1 items-start gap-6 px-5 py-5 lg:grid-cols-[1fr_380px] lg:gap-10 lg:px-12 lg:py-9">
        {/* На мобильном сумма закреплена сверху, на десктопе — в правой колонке */}
        <div className="sticky top-0 z-10 -mx-5 bg-base px-5 pt-1 pb-3 shadow-sticky lg:hidden">
          <TotalPanel total={plan.totalEstimatedPrice} budget={params.budget} />
        </div>

        <section className="min-w-0 lg:order-1">
          {loading ? (
            <DaySkeleton count={Math.min(params.days, 5)} />
          ) : (
            <div key={entry.id} className="flex flex-col gap-3.5">
              {days.map((day, index) => (
                /* Дни проявляются каскадом — переключение вариантов заметно */
                <div
                  key={day.dayNumber}
                  className="animate-screen-in"
                  style={{ animationDelay: `${Math.min(index, 6) * 45}ms` }}
                >
                  <DayCard day={day} defaultExpanded={index === 0} />
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:order-2">
          <div className="hidden lg:block">
            <TotalPanel
              total={plan.totalEstimatedPrice}
              budget={params.budget}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="animate-screen-in rounded-xl border border-danger-line bg-[#f7e0db] px-4 py-3 text-sm text-danger"
            >
              {error}
            </p>
          )}

          {loading && <LoadingNote />}

          <div className="flex gap-2.5">
            <Button
              variant="ghost"
              onClick={onBack}
              disabled={loading}
              className="flex-1 max-lg:h-14"
            >
              Параметры
            </Button>
            <Button
              onClick={onRetry}
              loading={loading}
              loadingLabel="Собираю…"
              className="flex-[1.4] max-lg:h-14"
            >
              Пересобрать
            </Button>
          </div>
        </aside>
      </main>
    </div>
  )
}
