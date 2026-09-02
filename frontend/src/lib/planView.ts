/** Что показывает экран результата: план по дням или список покупок. */
export type PlanView = 'days' | 'shopping'

/*
 * Вкладку и её панель связывают aria-controls / aria-labelledby, а живут они
 * в разных компонентах — id строит общая пара функций, чтобы они не разъехались.
 */
export const tabId = (prefix: string, view: PlanView) => `${prefix}-${view}-tab`

export const panelId = (prefix: string, view: PlanView) =>
  `${prefix}-${view}-panel`
