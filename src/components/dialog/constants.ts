// R-8.3-2: the defaults. The size list is the shared one, and Dialog bounds nothing, so it has no boundaries.ts.
import { DEFAULT_SIZE } from '#shared/contracts/size.js'

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const DIALOG_DEFAULTS = {
  size: DEFAULT_SIZE,
  closeButton: true,
} as const
