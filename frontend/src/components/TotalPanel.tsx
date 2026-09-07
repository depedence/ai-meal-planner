import { formatMoney } from '../lib/format'

interface TotalPanelProps {
  total: number
  budget: number
  /** Панель есть в разметке дважды — мобильная и десктопная копии, поэтому
      идентификатор для тестов задаётся снаружи. */
  testId?: string
}

export function TotalPanel({
  total,
  budget,
  testId = 'total-panel',
}: TotalPanelProps) {
  const overBudget = total > budget
  const filled = budget > 0 ? Math.min(total / budget, 1) * 100 : 0

  return (
    <div
      data-testid={testId}
      className={`flex flex-col gap-2.5 rounded-2xl border bg-base p-5 ${
        overBudget ? 'border-danger-line' : 'border-line'
      }`}
    >
      <p
        className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${
          overBudget ? 'text-danger' : 'text-ink-faint'
        }`}
      >
        Потрачено
      </p>

      <p
        data-testid={`${testId}-amount`}
        className={`font-display text-[44px] leading-none tnum lg:text-[62px] lg:leading-[0.95] ${
          overBudget ? 'text-danger' : 'text-ink'
        }`}
      >
        {formatMoney(total)}
      </p>

      <div className="h-2 overflow-hidden rounded-full bg-track">
        <div
          className={`h-full rounded-full ${overBudget ? 'bg-danger' : 'bg-accent'}`}
          style={{ width: `${filled}%` }}
        />
      </div>

      <div className="flex justify-between gap-3 text-[13px] tnum">
        <span data-testid={`${testId}-budget`} className="text-ink-soft">
          бюджет {formatMoney(budget)}
        </span>
        <span
          data-testid={`${testId}-rest`}
          className={`font-semibold ${overBudget ? 'text-danger' : 'text-success'}`}
        >
          {overBudget
            ? `превышение на ${formatMoney(total - budget)}`
            : `осталось ${formatMoney(budget - total)}`}
        </span>
      </div>
    </div>
  )
}
