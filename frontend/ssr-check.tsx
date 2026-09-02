import { renderToString } from 'react-dom/server'
import type { Meal, MealPlanRequest, MealPlanResponse } from './src/api/mealPlan'
import { parseMealPlan } from './src/api/mealPlan'
import { FormScreen } from './src/components/FormScreen'
import { ResultScreen } from './src/components/ResultScreen'
import { ShoppingList } from './src/components/ShoppingList'
import { formatMoney } from './src/lib/format'
import type { PlanEntry } from './src/lib/history'
import { loadHistory } from './src/lib/history'
import { clampRequest, DAYS_MAX, PEOPLE_MAX } from './src/lib/limits'
import { groupMealsByDay } from './src/lib/meals'
import { buildShoppingList } from './src/lib/shoppingList'

const params: MealPlanRequest = { budget: 2000, days: 2, peopleCount: 2, varietyLevel: 'MIXED' }
/* Плоский массив, дни намеренно вперемешку — проверяем группировку на фронте */
const plan: MealPlanResponse = {
  totalEstimatedPrice: 820,
  meals: [
    { dayNumber: 2, type: 'dinner', dishName: 'Гречка с овощами', estimatedPrice: 232,
      ingredients: [{ name: 'Гречка', amount: '300 г', estimatedPrice: 75 }] },
    { dayNumber: 1, type: 'breakfast', dishName: 'Овсянка с яблоком', estimatedPrice: 210,
      ingredients: [{ name: 'Овсяные хлопья', amount: '200 г', estimatedPrice: 34 }] },
    { dayNumber: 1, type: 'lunch', dishName: 'Куриный суп', estimatedPrice: 378, ingredients: [] },
  ],
}
const entry = (id: string, p = params, pl = plan): PlanEntry =>
  ({ id, createdAt: 1, params: p, plan: pl })

/* Список покупок: разный регистр и пробелы в одном названии, повтор количества,
   безымянный ингредиент и пустое количество — всё это приходит от LLM. */
const shoppingMeals: Meal[] = [
  { dayNumber: 1, type: 'breakfast', dishName: 'Каша', estimatedPrice: 100,
    ingredients: [
      { name: 'Молоко', amount: '200 мл', estimatedPrice: 30 },
      { name: 'Соль', amount: 'по вкусу', estimatedPrice: 1 },
    ] },
  { dayNumber: 1, type: 'lunch', dishName: 'Суп', estimatedPrice: 100,
    ingredients: [
      { name: '  молоко ', amount: '150 мл', estimatedPrice: 20 },
      { name: 'Соль', amount: 'По вкусу', estimatedPrice: 1 },
      { name: '', amount: '1 шт', estimatedPrice: 5 },
    ] },
  { dayNumber: 2, type: 'dinner', dishName: 'Блины', estimatedPrice: 100,
    ingredients: [
      { name: 'Молоко', amount: '200 мл', estimatedPrice: 30 },
      { name: 'Яйцо', amount: '', estimatedPrice: 12 },
    ] },
]
const shoppingItems = buildShoppingList(shoppingMeals)

const noop = () => {}
const form = (over: Partial<Parameters<typeof FormScreen>[0]> = {}) =>
  renderToString(<FormScreen params={params} history={[]} onChange={noop} onSubmit={noop}
    onOpenEntry={noop} loading={false} error={null} {...over} />)
const result = (over: Partial<Parameters<typeof ResultScreen>[0]> = {}) =>
  renderToString(<ResultScreen entry={entry('a')} position={1} total={1} loading={false}
    error={null} onPrev={noop} onNext={noop} onRetry={noop} onBack={noop} {...over} />)

const cases: [string, string][] = [
  ['form/idle', form()],
  ['form/loading', form({ loading: true })],
  ['form/error', form({ error: 'Сервис недоступен' })],
  ['form/history', form({ history: [entry('a'), entry('b', { ...params, days: 3 })] })],
  ['result', result()],
  ['result/nav-middle', result({ entry: entry('b'), position: 2, total: 3 })],
  ['result/nav-first', result({ position: 1, total: 3 })],
  ['result/over', result({ entry: entry('c', { ...params, budget: 500 }) })],
  ['result/loading', result({ loading: true })],
  ['result/error', result({ error: 'Сервис недоступен' })],
  ['shopping', renderToString(<ShoppingList items={shoppingItems} />)],
  ['shopping/empty', renderToString(<ShoppingList items={[]} />)],
]

const expect: Record<string, string[]> = {
  'form/idle': ['Составить план', '2 000 ₽', 'Одно и то же каждый день', 'aria-checked="true"',
    'min="1"', `max="${DAYS_MAX}"`, `max="${PEOPLE_MAX}"`, 'min="500"', 'max="15000"'],
  'form/loading': ['Собираю план…', 'disabled=""', 'aria-busy="true"', 'Считаем план', 'animate-progress'],
  'form/error': ['Сервис недоступен', 'role="alert"'],
  'form/history': ['Составленные планы', 'Вариант 1', 'Вариант 2', '3 дня',
    'Овсянка с яблоком', 'Гречка с овощами', 'Завтрак', 'Ужин', 'День 2',
    'Открыть план', 'aria-expanded="false"', 'grid-template-rows:0fr'],
  'result': ['Потрачено', '820 ₽', 'осталось 1 180 ₽', 'День 1', 'День 2',
    'Овсянка с яблоком', 'Куриный суп', 'Гречка с овощами', '588 ₽',
    'aria-expanded="true"', 'aria-expanded="false"', 'Завтрак', '232 ₽',
    'grid-template-rows:1fr', 'grid-template-rows:0fr', '<svg', 'rotate-180',
    'role="tablist"', 'role="tab"', 'По дням', 'Список покупок',
    'aria-selected="true"', 'aria-selected="false"', 'role="tabpanel"',
    'Экспорт плана', 'Экспорт списка покупок', 'План питания', '820 ₽ из 2 000 ₽'],
  'result/nav-middle': ['Вариант 2 из 3', 'Предыдущий вариант', 'Следующий вариант'],
  'result/nav-first': ['Вариант 1 из 3', 'cursor-not-allowed'],
  'result/over': ['Потрачено', 'превышение на 320 ₽', 'text-danger'],
  'result/loading': ['shimmer', 'Собираю…', 'Считаем план'],
  'result/error': ['Сервис недоступен', 'role="alert"'],
  'shopping': ['Список покупок', '3 позиции', 'Молоко', '200 мл, 150 мл',
    '(3 раза)', 'Соль', 'по вкусу', '(2 раза)', 'Яйцо', '(1 раз)', '80 ₽'],
  'shopping/empty': ['0 позиций', 'В этом плане не указаны ингредиенты.'],
}

const forbidden: Record<string, string[]> = {
  'form/history': ['грамм', 'aria-expanded="true"'],
  /* Вкладка «по дням» не должна тащить с собой разметку списка покупок */
  'result': ['В бюджете', '＋', 'позици', '(1 раз)'],
  'result/over': ['В бюджете'],
  /* Количества перечисляются, а не складываются */
  'shopping': ['350 мл', 'по вкусу, по вкусу'],
}

const normalize = (h: string) => h.replace(/<!-- -->/g, '').replace(/\u00A0/g, ' ')
let failed = 0
for (const [name, raw] of cases) {
  const html = normalize(raw)
  const missing = expect[name].filter((n) => !html.includes(n))
  const leaked = (forbidden[name] ?? []).filter((n) => html.includes(n))
  if (missing.length || leaked.length) {
    failed++
    console.log(`FAIL ${name}${missing.length ? ` missing=${JSON.stringify(missing)}` : ''}` +
      `${leaked.length ? ` leaked=${JSON.stringify(leaked)}` : ''}`)
  } else console.log(`ok   ${name}`)
}
/* Разбор недоверенных данных: ответ LLM и содержимое localStorage. */
const checks: [string, boolean][] = [
  ['parse/not-an-object', parseMealPlan(null) === null],
  ['parse/no-meals', parseMealPlan({ totalEstimatedPrice: 10 }) === null],
  ['parse/no-total', parseMealPlan({ meals: [] }) === null],
  ['parse/negative-total', parseMealPlan({ totalEstimatedPrice: -1, meals: [] }) === null],
  ['parse/numeric-strings',
    parseMealPlan({ totalEstimatedPrice: '820', meals: [] })?.totalEstimatedPrice === 820],
  ['parse/drops-broken-meal', parseMealPlan({
    totalEstimatedPrice: 100,
    meals: [
      null,
      { dayNumber: 1, type: 'lunch', estimatedPrice: 5 },
      { dayNumber: 1, type: 'lunch', dishName: 'Суп' },
      { dayNumber: 1, type: 'lunch', dishName: 'Суп', estimatedPrice: 5 },
    ],
  })?.meals.length === 1],
  ['parse/null-is-not-zero', parseMealPlan({
    totalEstimatedPrice: 100,
    meals: [
      { dayNumber: 1, type: 'lunch', dishName: 'Суп', estimatedPrice: null },
      { dayNumber: null, type: 'lunch', dishName: 'Суп', estimatedPrice: 5 },
      { dayNumber: 1, type: 'lunch', dishName: 'Суп', estimatedPrice: '' },
    ],
  })?.meals.length === 0],
  ['parse/null-total', parseMealPlan({ totalEstimatedPrice: null, meals: [] }) === null],
  ['parse/defaults-ingredients', parseMealPlan({
    totalEstimatedPrice: 100,
    meals: [{ dayNumber: 1, type: 'lunch', dishName: 'Суп', estimatedPrice: 5 }],
  })?.meals[0].ingredients.length === 0],

  ['group/sorts-days', groupMealsByDay(plan.meals).map((d) => d.dayNumber).join() === '1,2'],
  ['group/keeps-order',
    groupMealsByDay(plan.meals)[0].meals.map((m) => m.type).join() === 'breakfast,lunch'],
  ['group/skips-dayless',
    groupMealsByDay([{ ...plan.meals[0], dayNumber: Number.NaN }]).length === 0],

  ['shopping/sorted', shoppingItems.map((i) => i.name).join() === 'Молоко,Соль,Яйцо'],
  ['shopping/groups-ignoring-case', shoppingItems[0].count === 3],
  ['shopping/keeps-first-spelling', shoppingItems[0].name === 'Молоко'],
  ['shopping/lists-amounts', shoppingItems[0].amounts.join(', ') === '200 мл, 150 мл'],
  ['shopping/dedupes-amount-case', shoppingItems[1].amounts.join() === 'по вкусу'],
  ['shopping/sums-price', shoppingItems[0].totalPrice === 80],
  ['shopping/skips-nameless', shoppingItems.length === 3],
  ['shopping/keeps-empty-amount', shoppingItems[2].amounts.length === 0],
  ['shopping/no-meals', buildShoppingList(undefined).length === 0],
  ['shopping/survives-garbage', buildShoppingList(
    [null, { ingredients: null }, { ingredients: [{ name: 5 }, {}] }] as unknown as Meal[],
  ).length === 0],

  ['money/finite', formatMoney(1234) === '1\u00A0234\u00A0₽'],
  ['money/nan', formatMoney(Number.NaN) === '0\u00A0₽'],

  ['clamp/above-max', clampRequest({ ...params, days: 99 }).days === DAYS_MAX],
  ['clamp/empty-field', clampRequest({ ...params, peopleCount: 0 }).peopleCount === 1],
  ['clamp/above-budget', clampRequest({ ...params, budget: 1_000_000 }).budget === 15000],

  ['history/rejects-old-format', readHistory([
    { id: 'a', createdAt: 1, params, plan: { totalEstimatedPrice: 1, days: [] } },
  ]).length === 0],
  ['history/rejects-broken-params', readHistory([
    { id: 'a', createdAt: 1, params: { ...params, varietyLevel: 'HZ' }, plan },
  ]).length === 0],
  ['history/accepts-valid', readHistory([{ id: 'a', createdAt: 1, params, plan }]).length === 1],
  ['history/survives-garbage', readHistory('{{{').length === 0],
]

/** localStorage в node нет — подменяем на минимальную заглушку. */
function readHistory(stored: unknown): PlanEntry[] {
  const raw = typeof stored === 'string' ? stored : JSON.stringify(stored)
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => raw },
  })
  return loadHistory()
}

for (const [name, passed] of checks) {
  if (passed) console.log(`ok   ${name}`)
  else {
    failed++
    console.log(`FAIL ${name}`)
  }
}

console.log(failed ? `\n${failed} case(s) failed` : '\nall cases passed')
process.exit(failed ? 1 : 0)
