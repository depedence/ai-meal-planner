interface LogoProps {
  className?: string
}

/**
 * Знак + словесная часть. По спеке знак 24px в мобильной шапке и 28px на
 * десктопе; плашка со скруглением 25% зашита в сам logo.svg, поэтому CSS
 * радиус тут не нужен. alt пустой — название рядом уже читается скринридером.
 */
export function Logo({ className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/logo.svg"
        alt=""
        width={28}
        height={28}
        className="block size-6 shrink-0 lg:size-7"
      />
      <span className="font-display text-[19px] leading-none text-ink lg:text-[21px]">
        Кастрюля
      </span>
    </span>
  )
}
