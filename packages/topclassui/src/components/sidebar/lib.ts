import { cutLabel, resolveLabelDir } from '#shared/truncate-label.js'

const isText = (part: unknown): part is string | number => typeof part === 'string' || typeof part === 'number'

/** R-5.2-7 cuts a label to its box; this bounds the string itself, between two graphemes. Anything
 * that is not plain text passes as given: an element is the caller's own, and the box still clips it. */
export function boundLabel<Label>(label: Label, maxLength: number): Label | string {
  return typeof label === 'string' ? cutLabel(label, maxLength) : label
}

/** The dir of a label's own element: text alone follows resolveLabelDir, so an English label in an
 * Arabic rail keeps its start; a label that holds an element is the caller's markup and follows the page. */
export function resolveDir(label: unknown): 'auto' | undefined {
  const parts: unknown[] = Array.isArray(label) ? label : [label]
  return parts.every(isText) ? resolveLabelDir(parts.join('')) : undefined
}
