import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  loading?: boolean
  loadingLabel?: string
  children: ReactNode
}

const base =
  'inline-flex items-center justify-center gap-2.5 font-semibold transition-all duration-150 ease-out select-none disabled:cursor-not-allowed'

const variants = {
  primary: {
    idle: 'bg-ink text-base rounded-2xl px-8.5 py-4 text-base shadow-none hover:bg-ink-hover hover:shadow-hover hover:-translate-y-px active:bg-ink-active active:translate-y-0 active:scale-[0.985] active:shadow-none',
    disabled:
      'bg-muted text-ink-faint border border-line rounded-2xl px-8.5 py-4 text-base',
  },
  ghost: {
    idle: 'border border-ink text-ink rounded-xl px-7.5 py-3.5 text-[15px] hover:bg-muted active:bg-track',
    disabled:
      'border border-line text-ink-faint rounded-xl px-7.5 py-3.5 text-[15px]',
  },
} as const

export function Button({
  variant = 'primary',
  loading = false,
  loadingLabel,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const isBlocked = Boolean(disabled) || loading
  const styles = variants[variant]

  return (
    <button
      {...rest}
      disabled={isBlocked}
      aria-busy={loading || undefined}
      className={`${base} ${isBlocked && !loading ? styles.disabled : styles.idle} ${
        loading ? 'cursor-wait' : ''
      } ${className}`}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-base/35 border-t-base"
        />
      )}
      {loading ? (loadingLabel ?? children) : children}
    </button>
  )
}
