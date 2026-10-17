// R-5.6-1: a control that draws no text of its own is named by its caller, and the type refuses one with none.

/** A control: the id a `<label htmlFor>` points at, an `aria-label`, or an `aria-labelledby`. */
export type ControlName =
  | {
    /** The id a `<label htmlFor>` points at. */
    id: string
    'aria-label'?: string | undefined
    'aria-labelledby'?: string | undefined
  }
  | {
    id?: string | undefined
    /** The name read out when no visible label names the control. */
    'aria-label': string
    'aria-labelledby'?: string | undefined
  }
  | {
    id?: string | undefined
    'aria-label'?: string | undefined
    /** The id of the visible text that names the control. */
    'aria-labelledby': string
  }

/** A group, which no `<label htmlFor>` can name: an `aria-label`, or an `aria-labelledby`. */
export type GroupName =
  | {
    /** The name read out when no visible text names the group. */
    'aria-label': string
    'aria-labelledby'?: string | undefined
  }
  | {
    'aria-label'?: string | undefined
    /** The id of the visible text that names the group. */
    'aria-labelledby': string
  }
