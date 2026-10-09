// R-8.3-2: the value lists and the defaults. The bounds live in boundaries.ts.

/** The four shapes the docs previewer captions; text is the one its variant select shows. */
export const SKELETON_VARIANTS = ['text', 'circle', 'rect', 'card'] as const

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const SKELETON_DEFAULTS = {
  variant: 'text',
  rows: 3,
} as const
