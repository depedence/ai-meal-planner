export type VarietyLevel = 'SAME' | 'MIXED' | 'DIFFERENT'
export type MealType = 'breakfast' | 'lunch' | 'dinner'

export interface MealPlanRequest {
  budget: number
  days: number
  peopleCount: number
  varietyLevel: VarietyLevel
}

export interface Ingredient {
  name: string
  amount: string
  estimatedPrice: number
}

export interface Meal {
  dayNumber: number
  type: MealType
  dishName: string
  ingredients: Ingredient[]
  estimatedPrice: number
}

/**
 * Backend отдаёт плоский список приёмов пищи: день указан на самом приёме
 * (`dayNumber`), группировка по дням делается на фронте — см. groupMealsByDay.
 */
export interface MealPlanResponse {
  totalEstimatedPrice: number
  meals: Meal[]
}

const ENDPOINT = '/api/v1/meal-plan'

const GENERIC_ERROR =
  'Не удалось составить план. Попробуйте ещё раз через минуту.'

/**
 * Пользователю показываем только понятный текст: либо короткое сообщение
 * от backend, либо общую формулировку. Технические детали не выводим.
 */
function isUserFriendly(text: string): boolean {
  const trimmed = text.trim()
  return (
    trimmed.length > 0 &&
    trimmed.length <= 200 &&
    !trimmed.startsWith('{') &&
    !trimmed.startsWith('<') &&
    !/\bat [\w.$]+\(/.test(trimmed) &&
    !/Exception|\.java:\d+/.test(trimmed)
  )
}

export class MealPlanError extends Error {}

export async function fetchMealPlan(
  request: MealPlanRequest,
  signal?: AbortSignal,
): Promise<MealPlanResponse> {
  let response: Response
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new MealPlanError(
      'Не удалось связаться с сервером. Проверьте соединение и попробуйте снова.',
    )
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new MealPlanError(
      isUserFriendly(body) ? body.trim() : GENERIC_ERROR,
    )
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new MealPlanError(GENERIC_ERROR)
  }

  const plan = parseMealPlan(payload)
  if (!plan) throw new MealPlanError(GENERIC_ERROR)
  return plan
}

/**
 * Ответ модели проходит через LLM, поэтому доверять его форме нельзя:
 * без разбора недостающее число доезжает до вёрстки и печатается как «NaN ₽».
 * Разбор терпимый — отдельное битое блюдо выбрасывается, а не рушит весь план,
 * — но всё, что дошло до экрана, гарантированно нужного типа.
 * Возвращает null, если payload непригоден. Используется и при чтении истории.
 */
export function parseMealPlan(value: unknown): MealPlanResponse | null {
  if (!isRecord(value)) return null

  const totalEstimatedPrice = toPrice(value.totalEstimatedPrice)
  if (totalEstimatedPrice === null) return null
  if (!Array.isArray(value.meals)) return null

  return {
    totalEstimatedPrice,
    meals: value.meals.filter(isRecord).map(toMeal).filter(isPresent),
  }
}

function toMeal(value: Record<string, unknown>): Meal | null {
  const dayNumber = toNumber(value.dayNumber)
  const estimatedPrice = toPrice(value.estimatedPrice)
  if (dayNumber === null || estimatedPrice === null) return null
  if (typeof value.type !== 'string' || !value.type) return null
  if (typeof value.dishName !== 'string' || !value.dishName) return null

  const ingredients = Array.isArray(value.ingredients)
    ? value.ingredients.filter(isRecord).map(toIngredient).filter(isPresent)
    : []

  return {
    dayNumber: Math.trunc(dayNumber),
    // Неизвестный тип приёма пищи не отбрасываем: вёрстка показывает его как есть.
    type: value.type as MealType,
    dishName: value.dishName,
    ingredients,
    estimatedPrice,
  }
}

function toIngredient(value: Record<string, unknown>): Ingredient | null {
  const estimatedPrice = toPrice(value.estimatedPrice)
  if (estimatedPrice === null) return null
  if (typeof value.name !== 'string' || !value.name) return null

  return {
    name: value.name,
    amount: typeof value.amount === 'string' ? value.amount : '',
    estimatedPrice,
  }
}

/** Цена — целое неотрицательное число рублей; всё остальное непригодно. */
function toPrice(value: unknown): number | null {
  const price = toNumber(value)
  if (price === null || price < 0) return null
  return Math.round(price)
}

/**
 * Модель иногда присылает число строкой, поэтому строку принимаем — но только
 * непустую и целиком числовую. Через Number() нельзя: Number(null) и Number('')
 * дают 0, и отсутствующая цена выглядела бы как бесплатное блюдо.
 */
function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string' || !value.trim()) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPresent<T>(value: T | null): value is T {
  return value !== null
}
