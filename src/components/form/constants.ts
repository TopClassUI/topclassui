// R-8.3-2: the defaults. Neither half has a design prop, so there is no value list and no schema.

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const FORM_DEFAULTS = {
  /** FormAction's state before the first answer: no errors. Frozen, since every form shares it. */
  initialState: Object.freeze({}),
} as const
