// R-8.3-2: the value lists and the defaults. Switch bounds nothing, so it has no boundaries.ts (R-8.3-6).
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'

export const SWITCH_SIZES = SIZES

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const SWITCH_DEFAULTS = {
  size: DEFAULT_SIZE,
  invalid: false,
  // Base UI's own default, held by our hook: Base UI is always handed the controlled pair.
  defaultChecked: false,
} as const
