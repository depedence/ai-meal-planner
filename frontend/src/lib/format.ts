const NBSP = '\u00A0'

/** «5 840 ₽» — неразрывный пробел как разделитель тысяч и перед знаком рубля. */
export function formatMoney(value: number): string {
  // Последняя защита: «NaN ₽» на экране хуже, чем нулевая цена.
  const rounded = Number.isFinite(value) ? Math.round(value) : 0
  const grouped = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
  return `${rounded < 0 ? '−' : ''}${grouped}${NBSP}₽`
}

/** Русские склонения: 1 день / 2 дня / 5 дней. */
export function plural(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  const mod100 = Math.abs(count) % 100
  const mod10 = mod100 % 10
  if (mod100 >= 11 && mod100 <= 14) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}
