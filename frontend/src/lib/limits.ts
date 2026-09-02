import type { MealPlanRequest, VarietyLevel } from '../api/mealPlan'

// Границы намеренно узкие: один запрос — это токены Groq, а длинный план
// упирается в max_completion_tokens и ломает разбор ответа. Значения должны
// совпадать с @Min/@Max на MealPlanRequest в backend.
export const BUDGET_MIN = 500
export const BUDGET_MAX = 15000
export const BUDGET_STEP = 100
export const DAYS_MIN = 1
export const DAYS_MAX = 7
export const PEOPLE_MIN = 1
export const PEOPLE_MAX = 5

export const VARIETY_LEVELS = ['SAME', 'MIXED', 'DIFFERENT'] as const

export function isVarietyLevel(value: unknown): value is VarietyLevel {
  return VARIETY_LEVELS.includes(value as VarietyLevel)
}

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

/**
 * Поля формы можно набрать с клавиатуры, поэтому между вводом и отправкой
 * значение успевает побывать вне диапазона (пустая строка, «12» вместо «1»).
 * Приводим запрос к допустимым границам, чтобы backend не отвечал 400.
 */
export function clampRequest(request: MealPlanRequest): MealPlanRequest {
  return {
    budget:
      Math.round(clamp(request.budget, BUDGET_MIN, BUDGET_MAX) / BUDGET_STEP) *
      BUDGET_STEP,
    days: Math.round(clamp(request.days, DAYS_MIN, DAYS_MAX)),
    peopleCount: Math.round(clamp(request.peopleCount, PEOPLE_MIN, PEOPLE_MAX)),
    varietyLevel: isVarietyLevel(request.varietyLevel)
      ? request.varietyLevel
      : 'MIXED',
  }
}
