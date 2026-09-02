import { useCallback, useEffect, useRef, useState } from 'react'
import type { MealPlanRequest } from './api/mealPlan'
import { fetchMealPlan, MealPlanError } from './api/mealPlan'
import { Footer } from './components/Footer'
import { FormScreen } from './components/FormScreen'
import { ResultScreen } from './components/ResultScreen'
import type { PlanEntry } from './lib/history'
import { appendEntry, createEntry, loadHistory, saveHistory } from './lib/history'

const INITIAL_PARAMS: MealPlanRequest = {
  budget: 3000,
  days: 5,
  peopleCount: 2,
  varietyLevel: 'MIXED',
}

export default function App() {
  const [params, setParams] = useState<MealPlanRequest>(INITIAL_PARAMS)
  const [history, setHistory] = useState<PlanEntry[]>(loadHistory)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)
  const inFlight = useRef<AbortController | null>(null)

  useEffect(() => {
    saveHistory(history)
  }, [history])

  // Незавершённый запрос при уходе со страницы держит соединение и заканчивается
  // обновлением состояния размонтированного дерева — обрываем его явно.
  useEffect(() => () => inFlight.current?.abort(), [])

  // Параметры передаём явно: «Пересобрать» использует параметры варианта,
  // а не то, что осталось в форме.
  const submit = useCallback(async (request: MealPlanRequest) => {
    // Счётчик отсекает ответ устаревшего запроса, если он придёт позже нового.
    const current = ++requestId.current
    inFlight.current?.abort()
    const controller = new AbortController()
    inFlight.current = controller
    setLoading(true)
    setError(null)
    try {
      const plan = await fetchMealPlan(request, controller.signal)
      if (requestId.current !== current) return
      const entry = createEntry(request, plan)
      setHistory((entries) => appendEntry(entries, entry))
      setActiveId(entry.id)
    } catch (caught) {
      // Отмену инициировали мы сами — это не ошибка для пользователя.
      if (caught instanceof DOMException && caught.name === 'AbortError') return
      if (requestId.current !== current) return
      setError(
        caught instanceof MealPlanError
          ? caught.message
          : 'Что-то пошло не так. Попробуйте ещё раз.',
      )
    } finally {
      if (inFlight.current === controller) inFlight.current = null
      if (requestId.current === current) setLoading(false)
    }
  }, [])

  const activeIndex = history.findIndex((entry) => entry.id === activeId)
  const activeEntry = activeIndex >= 0 ? history[activeIndex] : null

  const screen = !activeEntry ? (
    <FormScreen
      params={params}
      history={history}
      onChange={setParams}
      onSubmit={(next) => void submit(next)}
      onOpenEntry={(id) => {
        setError(null)
        setActiveId(id)
      }}
      loading={loading}
      error={error}
    />
  ) : (
    <ResultScreen
      entry={activeEntry}
      position={activeIndex + 1}
      total={history.length}
      loading={loading}
      error={error}
      onPrev={() => setActiveId(history[activeIndex - 1]?.id ?? activeId)}
      onNext={() => setActiveId(history[activeIndex + 1]?.id ?? activeId)}
      onRetry={() => {
        setParams(activeEntry.params)
        void submit(activeEntry.params)
      }}
      onBack={() => {
        setActiveId(null)
        setError(null)
      }}
    />
  )

  return (
    <div className="flex min-h-dvh flex-col">
      {screen}
      <Footer />
    </div>
  )
}
