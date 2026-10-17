// R-5.12-1: the pure helpers of the hooks, with no React in them.
import type { ListOption } from '#shared/contracts/option.js'

/** How Base UI reads an option: its value is what is chosen and sent, its label what is shown and matched. */
export const optionAccessors = {
  getValue: (option: ListOption) => option.value,
  getLabel: (option: ListOption) => option.label,
}

/** The key windowing tells two rows apart by. Module scope, so useCollection's memo holds. */
export function keyOfOption(option: ListOption): string {
  return option.value
}

/** Whether `after` is `before` with options added at its end: a page arrived, and the list stays where it was. */
export function isAppended(before: readonly ListOption[], after: readonly ListOption[]): boolean {
  return after.length > before.length && before.every((option, index) => after[index] === option)
}

/** The scrollTop that shows a row whole, `inset` px inside the edge it was cut by; a row in view moves nothing. */
export function revealTop(rowTop: number, rowHeight: number, scrollTop: number, viewHeight: number, inset: number): number {
  if (rowTop - inset < scrollTop) return Math.max(0, rowTop - inset)
  if (rowTop + rowHeight + inset > scrollTop + viewHeight) return rowTop + rowHeight + inset - viewHeight
  return scrollTop
}

/** The text of the labels that point at an input, or undefined when none does. */
export function nameFromLabels(input: HTMLInputElement | null): string | undefined {
  const text = [...(input?.labels ?? [])].map((label) => label.textContent.trim()).filter((part) => part !== '').join(' ')
  return text === '' ? undefined : text
}
