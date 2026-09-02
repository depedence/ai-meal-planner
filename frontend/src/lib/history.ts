import type { MealPlanRequest, MealPlanResponse } from '../api/mealPlan'
import { parseMealPlan } from '../api/mealPlan'
import { clampRequest, isVarietyLevel } from './limits'

export interface PlanEntry {
  id: string
  createdAt: number
  params: MealPlanRequest
  plan: MealPlanResponse
}

const STORAGE_KEY = 'aimealplanner.plans.v1'
export const HISTORY_LIMIT = 10

/** Планы хранятся от старых к новым; переполнение отбрасывает самые старые. */
export function loadHistory(): PlanEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(toPlanEntry)
      .filter((entry): entry is PlanEntry => entry !== null)
      .slice(-HISTORY_LIMIT)
  } catch {
    return []
  }
}

export function saveHistory(entries: PlanEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-HISTORY_LIMIT)))
  } catch {
    // Приватный режим или переполнение — история просто не переживёт перезагрузку.
  }
}

/** Новый вариант плана. Идентификатор нужен сразу, чтобы открыть его на экране. */
export function createEntry(
  params: MealPlanRequest,
  plan: MealPlanResponse,
): PlanEntry {
  return {
    id:
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: Date.now(),
    params,
    plan,
  }
}

export function appendEntry(
  entries: PlanEntry[],
  entry: PlanEntry,
): PlanEntry[] {
  return [...entries, entry].slice(-HISTORY_LIMIT)
}

/**
 * localStorage — недоверенный ввод: его правит пользователь, и там лежат записи
 * от прежних версий формата. Разбираем запись целиком и отбрасываем непригодную,
 * иначе undefined из хранилища доезжает до вёрстки и печатается как «NaN ₽».
 */
function toPlanEntry(value: unknown): PlanEntry | null {
  if (typeof value !== 'object' || value === null) return null
  const entry = value as Record<string, unknown>

  if (typeof entry.id !== 'string' || !entry.id) return null
  if (typeof entry.createdAt !== 'number' || !Number.isFinite(entry.createdAt)) {
    return null
  }

  const params = toParams(entry.params)
  const plan = parseMealPlan(entry.plan)
  if (!params || !plan) return null

  return { id: entry.id, createdAt: entry.createdAt, params, plan }
}

function toParams(value: unknown): MealPlanRequest | null {
  if (typeof value !== 'object' || value === null) return null
  const params = value as Record<string, unknown>

  const budget = Number(params.budget)
  const days = Number(params.days)
  const peopleCount = Number(params.peopleCount)
  if (![budget, days, peopleCount].every(Number.isFinite)) return null
  if (!isVarietyLevel(params.varietyLevel)) return null

  return clampRequest({
    budget,
    days,
    peopleCount,
    varietyLevel: params.varietyLevel,
  })
}
