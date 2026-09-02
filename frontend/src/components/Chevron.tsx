/** Шеврон раскрытия. Именно шеврон, а не «−»: минус читался бы как удаление. */
export function Chevron({
  expanded,
  className = '',
}: {
  expanded: boolean
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 12 8"
      aria-hidden="true"
      className={`size-3 shrink-0 transition-transform duration-200 ease-out ${
        expanded ? 'rotate-180' : ''
      } ${className}`}
    >
      <path
        d="M1 1.75 6 6.25 11 1.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
