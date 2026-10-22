// R-8.3-2: the defaults. EmptyState bounds nothing, so it has no boundaries.ts.

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const EMPTY_STATE_DEFAULTS = {
  compact: false,
  bordered: true,
} as const
