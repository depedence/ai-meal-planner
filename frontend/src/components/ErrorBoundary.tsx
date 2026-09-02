import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Footer } from './Footer'
import { Logo } from './Logo'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  failed: boolean
}

/**
 * Без границы любая ошибка рендера размонтирует всё дерево и оставляет пустую
 * страницу без единого объяснения. Показываем понятный экран и даём выход:
 * «Начать заново» чистит сохранённые планы — обычно ломается именно запись
 * из localStorage, пережившая смену формата.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Не удалось отрисовать экран:', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <div className="flex min-h-dvh flex-col">
        <main className="mx-auto flex w-full max-w-[1344px] flex-1 flex-col items-start justify-center gap-4 px-5 py-14 lg:px-12">
          <Logo />
          <p className="text-[11px] font-semibold tracking-[0.18em] text-ink-faint uppercase">
            Планировщик питания
          </p>
          <h1 className="font-display text-[36px] leading-[1.08] text-ink lg:text-[52px]">
            Что-то сломалось
          </h1>
          <p className="max-w-[62ch] text-[17px] leading-relaxed text-ink-muted text-pretty">
            Страницу не удалось отрисовать. Обновите её — если не поможет,
            очистите сохранённые планы и начните заново.
          </p>
          <div className="flex flex-col gap-2.5 pt-2 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-2xl bg-ink px-8.5 py-4 text-base font-semibold text-base transition-all duration-150 ease-out hover:bg-ink-hover active:bg-ink-active"
            >
              Обновить страницу
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.clear()
                } catch {
                  // Хранилище недоступно — перезагрузки всё равно достаточно.
                }
                window.location.reload()
              }}
              className="inline-flex items-center justify-center rounded-xl border border-ink px-7.5 py-3.5 text-[15px] font-semibold text-ink transition-colors duration-150 hover:bg-muted active:bg-track"
            >
              Начать заново
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
}
