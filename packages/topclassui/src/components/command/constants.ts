// R-8.3-2: the defaults. The bound of visibleRows lives in boundaries.ts.
import { COLLECTION_DEFAULTS } from '#shared/contracts/collection.js'

/** Where guardEscape looks for a popup still open: the palette, once something in it other than its
 * own input shows one. The input is a combobox whose list is always open, so it is left out. */
export const COMMAND_ESCAPE_GUARD = '[role="dialog"]:has([data-popup-open]:not([role="combobox"]))'

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const COMMAND_DEFAULTS = {
  // With Ctrl or Cmd, matched by the key's name and by its place on the keyboard.
  shortcut: 'k',
  defaultOpen: false,
  virtualize: 'auto',
  // The --tc-list-rows knob, which applies whenever the prop is left out.
  visibleRows: COLLECTION_DEFAULTS.visibleRows,
} as const
