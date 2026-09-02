import { formatMoney, plural } from '../lib/format'
import type { ShoppingItem } from '../lib/shoppingList'

/**
 * Агрегированный список покупок по всему плану. Количества показываем
 * перечислением, а не суммой, — см. buildShoppingList.
 */
export function ShoppingList({ items }: { items: ShoppingItem[] }) {
  return (
    /* На печати рамка и заголовок карточки не нужны: шапку листа
       рисует ResultScreen, а лишний контур только режет список. */
    <article className="rounded-2xl border border-line bg-surface print:border-0">
      <div className="flex items-baseline justify-between gap-4 px-4.5 py-4 print:hidden md:px-7.5 md:py-5">
        <h3 className="font-display text-[20px] leading-tight text-ink md:text-[26px]">
          Список покупок
        </h3>
        <p className="shrink-0 text-sm text-ink-muted tnum">
          {items.length}{' '}
          {plural(items.length, 'позиция', 'позиции', 'позиций')}
        </p>
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-col border-t border-track px-4.5 py-1.5 print:border-t-0 print:p-0 md:px-7.5 md:py-2.5">
          {items.map((item) => (
            <li
              key={item.key}
              className="print-keep flex flex-col gap-0.5 border-b border-track py-2.5 last:border-b-0"
            >
              <div className="flex items-baseline gap-2.5">
                <span className="min-w-0 text-[15px] leading-snug text-ink text-pretty print:text-[13pt]">
                  {item.name}
                </span>
                <span
                  aria-hidden="true"
                  className="min-w-4 flex-1 -translate-y-[3px] border-b border-dotted border-leader"
                />
                <span className="shrink-0 text-[13px] text-ink-muted tnum print:text-[11pt]">
                  {formatMoney(item.totalPrice)}
                </span>
              </div>
              <p className="text-[13px] leading-snug text-ink-soft print:text-[11pt]">
                {item.amounts.length > 0 && <>{item.amounts.join(', ')} </>}
                <span className="tnum">
                  ({item.count} {plural(item.count, 'раз', 'раза', 'раз')})
                </span>
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="border-t border-track px-4.5 py-4 text-sm text-ink-soft md:px-7.5">
          В этом плане не указаны ингредиенты.
        </p>
      )}
    </article>
  )
}
