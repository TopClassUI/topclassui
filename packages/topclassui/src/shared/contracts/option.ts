// R-5.1-3: plain data, so a Server Component can pass a whole list to Select or Combobox.

/** One choice in a list. Base UI reads `{ value, label }` as it is: the label for the trigger, the value for the form. */
export type ListOption = {
  /** What the form receives and what `value` and `onValueChange` carry. Unique in its list. */
  value: string
  /** What the row and the trigger show, and what a query is matched against. */
  label: string
  disabled?: boolean | undefined
}
