// R-8.3-2: the defaults and the one time constant. CodeBlock bounds nothing, so it has no boundaries.ts.

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const CODE_BLOCK_DEFAULTS = {
  showCopy: true,
  wrap: false,
} as const

/** How long the tick and the spoken "Copied" last before the button is ready to say it again. */
export const COPY_RESET_MS = 2000
