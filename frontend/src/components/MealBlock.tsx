import type { Meal } from '../api/mealPlan'
import { formatMoney } from '../lib/format'
import { MEAL_TITLES } from '../lib/meals'

export function MealBlock({ meal }: { meal: Meal }) {
  return (
    <div data-testid="meal-block" className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-baseline gap-2.5">
        <span
          data-testid="meal-type"
          className="shrink-0 text-[11px] tracking-[0.14em] text-ink-faint uppercase"
        >
          {MEAL_TITLES[meal.type] ?? meal.type}
        </span>
        <span
          aria-hidden="true"
          className="min-w-4 flex-1 -translate-y-[3px] border-b border-dotted border-leader"
        />
        <span
          data-testid="meal-price"
          className="shrink-0 text-[13px] text-ink-muted tnum"
        >
          {formatMoney(meal.estimatedPrice)}
        </span>
      </div>

      <p
        data-testid="meal-dish"
        className="font-display text-[20px] leading-tight text-ink text-pretty max-md:font-sans max-md:text-[16px]"
      >
        {meal.dishName}
      </p>

      {meal.ingredients?.length > 0 && (
        <ul data-testid="meal-ingredients" className="flex flex-col gap-1">
          {meal.ingredients.map((ingredient, index) => (
            <li
              key={`${ingredient.name}-${index}`}
              data-testid="ingredient-row"
              className="flex items-baseline justify-between gap-3 text-[13px] leading-snug text-ink-muted"
            >
              <span
                data-testid="ingredient-name"
                className="min-w-0 text-pretty"
              >
                {ingredient.name}
                {ingredient.amount ? `, ${ingredient.amount}` : ''}
              </span>
              <span data-testid="ingredient-price" className="shrink-0 tnum">
                {formatMoney(ingredient.estimatedPrice)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
