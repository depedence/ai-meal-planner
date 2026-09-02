/** Текстовый индикатор ожидания: запрос к AI занимает несколько секунд. */
export function LoadingNote({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="h-1 overflow-hidden rounded-full bg-track">
        <div className="animate-progress h-full w-1/4 rounded-full bg-accent" />
      </div>
      <p className="text-xs text-ink-soft" role="status">
        Считаем план
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="animate-dot"
            style={{ animationDelay: `${index * 160}ms` }}
          >
            .
          </span>
        ))}{' '}
        Обычно занимает несколько секунд.
      </p>
    </div>
  )
}
