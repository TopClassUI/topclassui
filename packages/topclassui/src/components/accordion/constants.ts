// R-8.3-2: the value list and the defaults. The bounds live in boundaries.ts.
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'

export const ACCORDION_SIZES = SIZES

/** The tag for each heading level an item can take. An h1 is the page's own title. */
export const ACCORDION_HEADINGS = { 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h5', 6: 'h6' } as const

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const ACCORDION_DEFAULTS = {
  // Base UI's own default is false, which leaves a closed panel out of the HTML.
  hiddenUntilFound: true,
  // Base UI's own header is an h3.
  headingLevel: 3,
  size: DEFAULT_SIZE,
} as const

/** How long a press holds its trigger in place: well past the fade, after which the panel that closes gives its room back. */
export const ACCORDION_HOLD_MS = 1000
