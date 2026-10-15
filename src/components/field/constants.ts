// R-8.3-2: the defaults. Field has no value list and no bound of its own, so it has no boundaries.ts.

/** Every prop's starting value. `invalid` has none of its own: it follows whether `error` holds a message. */
export const FIELD_DEFAULTS = {
  required: false,
  inline: false,
} as const

/** What each id of a field adds to the control's own: `<id>-label`, `<id>-hint`, `<id>-err`. */
export const FIELD_ID_SUFFIX = {
  label: '-label',
  hint: '-hint',
  error: '-err',
} as const
