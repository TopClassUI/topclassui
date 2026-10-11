// R-8.3-2: the value list and the defaults. The size list is the shared one, and Drawer bounds nothing, so it has no boundaries.ts.
import { DEFAULT_SIZE } from '#shared/contracts/size.js'

/** R-5.3-4: the edge the sheet slides from. `start` and `end` follow the direction: never a physical side. */
export const DRAWER_PLACEMENTS = ['start', 'end', 'top', 'bottom'] as const

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const DRAWER_DEFAULTS = {
  placement: 'end',
  size: DEFAULT_SIZE,
  // Base UI's own default, named here because the popup reads it too: only true draws a scrim.
  modal: true,
} as const
