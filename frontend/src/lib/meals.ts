import type { Meal, MealType } from '../api/mealPlan'

export const MEAL_TITLES: Record<MealType, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
}

/** День плана: собирается на фронте из плоского списка приёмов пищи. */
export interface DayPlan {
  dayNumber: number
  meals: Meal[]
}

/**
 * Backend отдаёт `meals` одним плоским массивом, день указан на каждом приёме
 * пищи. Схлопываем его в список дней по возрастанию `dayNumber`; порядок
 * приёмов внутри дня сохраняем таким, каким он пришёл с сервера.
 */
export function groupMealsByDay(meals: Meal[] | undefined): DayPlan[] {
  const byDay = (meals ?? []).reduce((acc, meal) => {
    const dayNumber = Number(meal?.dayNumber)
    if (!Number.isFinite(dayNumber)) return acc
    const day = acc.get(dayNumber)
    if (day) day.meals.push(meal)
    else acc.set(dayNumber, { dayNumber, meals: [meal] })
    return acc
  }, new Map<number, DayPlan>())

  return [...byDay.values()].sort((a, b) => a.dayNumber - b.dayNumber)
}
