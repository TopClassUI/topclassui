// R-8.3-2: the value lists and the defaults. Separator bounds nothing, so it has no boundaries.ts.
export const SEPARATOR_ORIENTATIONS = ['horizontal', 'vertical'] as const

/** Every prop's starting value. A caller overrides either by passing the prop.
 * Decorative, as the Figma frame description and the docs playground have it. */
export const SEPARATOR_DEFAULTS = {
  orientation: 'horizontal',
  decorative: true,
} as const
