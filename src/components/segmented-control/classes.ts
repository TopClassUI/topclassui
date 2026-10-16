// R-5.12-4: the class strings of the segmented control, built from the shared constants (unit-4.md, SegmentedControl).
import {
  BORDER, CONTAIN, DISABLED, FIELD_INVALID, FOCUS_RING_INSET, SCROLL_X, TOUCH_TARGET, TRANSITION,
} from '#shared/classes.js'

/** A grid of one column that may shrink to nothing, as TABS_ROOT is: a track that scrolls would otherwise widen a
 * table cell or a shrinking parent to the width of all its segments. */
export const SEGMENTED_HOLDER = 'grid grid-cols-1'

/** fullWidth, on the holder: in a flex row it would otherwise be as wide as its segments. */
export const SEGMENTED_HOLDER_FULL = 'w-full'

/** The track scrolls sideways inside itself when its segments do not fit, as a list of tabs does. w-fit: a grid item
 * would fill its holder. It is the offset parent of its segments and keeps a pixel of scroll padding (tabs/classes.ts). */
export const SEGMENTED_ROOT = `relative flex w-fit max-w-full items-stretch gap-0.5 rounded-control bg-surface p-0.75 scroll-px-px ${BORDER} ${SCROLL_X} ${FIELD_INVALID}`

/** The height of the track. A segment stretches to it and never goes under its own 24 px, 44 under a finger. */
export const SEGMENTED_ROOT_SIZE = { xs: 'min-h-control-xs', sm: 'min-h-control-sm', md: 'min-h-control-md', lg: 'min-h-control-lg', xl: 'min-h-control-xl', custom: '' } as const

/** Merged after the track by cn(): w-full replaces w-fit, and the segments share the width. */
export const SEGMENTED_FULL = 'w-full *:flex-1'

/** The selected segment is raised and heavier. Forced colours erase both, so there it takes the system pair, and
 * GrayText when disabled, which the browser gives every other disabled segment. */
export const SEGMENTED_ITEM = [
  'inline-flex shrink-0 items-center justify-center-safe gap-1.5 overflow-hidden whitespace-nowrap rounded-control font-medium text-muted',
  'data-checked:bg-surface-raised data-checked:font-semibold data-checked:text-body data-checked:shadow-sm',
  'forced-colors:data-checked:forced-color-adjust-none forced-colors:data-checked:bg-[Highlight] forced-colors:data-checked:text-[HighlightText]',
  'forced-colors:data-checked:shadow-none forced-colors:data-checked:[--tc-ring:HighlightText]',
  'forced-colors:data-checked:data-disabled:bg-[GrayText] forced-colors:data-checked:data-disabled:text-[Canvas]',
  CONTAIN, FOCUS_RING_INSET, TOUCH_TARGET, TRANSITION, DISABLED,
].join(' ')

/** The inline padding and the type step of a segment; custom emits none. */
export const SEGMENTED_ITEM_SIZE = { xs: 'px-2 text-xs', sm: 'px-2.5 text-sm', md: 'px-3 text-sm', lg: 'px-4 text-base', xl: 'px-5 text-base', custom: '' } as const

/** The icon before the label keeps its size when the label is cut. */
export const SEGMENTED_ICON = 'flex shrink-0'
