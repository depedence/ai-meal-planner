import type { Meal } from '../api/mealPlan'

/** Строка списка покупок: один ингредиент, собранный по всему плану. */
export interface ShoppingItem {
  /** Ключ группировки: имя без регистра и лишних пробелов. */
  key: string
  /** Имя в том написании, в каком оно впервые встретилось в плане. */
  name: string
  /** Встретившиеся количества в порядке появления, без повторов. */
  amounts: string[]
  /** Сколько раз ингредиент встречается в плане. */
  count: number
  /** Сумма оценок стоимости по всем упоминаниям. */
  totalPrice: number
}

/**
 * Количества намеренно не складываются: единицы разные и часто текстовые
 * («по вкусу», «щепотка»), поэтому «200 мл + 1 стакан» сложить нечем — все
 * встретившиеся количества перечисляются как есть, а сколько раз ингредиент
 * нужен, показывает count.
 *
 * Данные приходят от LLM, поэтому разбор терпимый: безымянный ингредиент
 * пропускается, нечисловая цена считается нулём, остальной список выживает.
 */
export function buildShoppingList(meals: Meal[] | undefined): ShoppingItem[] {
  const items = new Map<string, ShoppingItem>()

  for (const meal of meals ?? []) {
    for (const ingredient of meal?.ingredients ?? []) {
      const name = normalize(ingredient?.name)
      if (!name) continue

      const key = name.toLowerCase()
      const item = items.get(key) ?? {
        key,
        name,
        amounts: [],
        count: 0,
        totalPrice: 0,
      }

      item.count += 1
      if (typeof ingredient.estimatedPrice === 'number') {
        item.totalPrice += Number.isFinite(ingredient.estimatedPrice)
          ? ingredient.estimatedPrice
          : 0
      }

      const amount = normalize(ingredient?.amount)
      const known = amount.toLowerCase()
      if (amount && !item.amounts.some((was) => was.toLowerCase() === known)) {
        item.amounts.push(amount)
      }

      items.set(key, item)
    }
  }

  // По алфавиту: так список читается в магазине, а не в порядке блюд.
  return [...items.values()].sort((a, b) => a.name.localeCompare(b.name, 'ru'))
}

function normalize(value: unknown): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : ''
}
