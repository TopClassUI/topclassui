// R-8.3-2: the defaults, and the one name the bar and the page share. The bound lives in boundaries.ts.

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const NAVBAR_DEFAULTS = {
  sticky: true,
  current: false,
} as const

/** R-10.5-3: where a sticky bar writes its height, and what src/tokens.css reads into scroll-padding. */
export const NAVBAR_OFFSET_VARIABLE = '--tc-sticky-top'
