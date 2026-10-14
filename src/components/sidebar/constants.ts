// R-8.3-2: the defaults. Sidebar has no value list: open and current are booleans. The bound of a label lives in boundaries.ts.

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const SIDEBAR_DEFAULTS = {
  // Expanded, so the HTML the server sends shows every label before any script runs.
  defaultOpen: true,
  current: false,
} as const
