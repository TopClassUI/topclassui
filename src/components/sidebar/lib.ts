/** R-5.2-7 cuts a label to its box; this bounds the string itself. Anything that is not
 * plain text passes as given: an element is the caller's own, and the box still clips it. */
export function boundLabel<Label>(label: Label, maxLength: number): Label | string {
  return typeof label === 'string' ? label.slice(0, maxLength) : label
}
