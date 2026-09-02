import { formatMoney } from '../lib/format'

interface TotalPanelProps {
  total: number
  budget: number
}

export function TotalPanel({ total, budget }: TotalPanelProps) {
  const overBudget = total > budget
  const filled = budget > 0 ? Math.min(total / budget, 1) * 100 : 0

  return (
    <div
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
        <span className="text-ink-soft">бюджет {formatMoney(budget)}</span>
        <span
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
