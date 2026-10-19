// R-5.12-4: one class string per element Command styles, built from the shared overlay constants.
import {
  CONTAIN, DISABLED, FADE_MOTION, FOCUS_RING_INSET, LIST_CAP, OVERLAY_SURFACE, POPUP_MOTION, ROW, SCRIM,
  SCROLL_AREA,
} from '#shared/classes.js'

/** The scrim, on the dialog layer. It fades; the page behind is locked by Base UI. */
export const COMMAND_BACKDROP = `${SCRIM} z-(--tc-z-dialog) ${FADE_MOTION}`

/** The whole screen. The popup hangs from 15% down rather than centring, so it stays put as the results change. */
export const COMMAND_VIEWPORT = 'fixed inset-0 z-(--tc-z-dialog) flex items-start justify-center p-(--tc-overlay-inset) pt-[15dvh]'

/** A column that ends the inset above the bottom, so the list is what gives way. No overflow-hidden:
 * it would cut the ring of the input. The popup's own ring is drawn inside it, never on the scrim. */
export const COMMAND_POPUP = [
  'flex max-h-[calc(85dvh-var(--tc-overlay-inset))] w-full max-w-100 flex-col wrap-anywhere',
  OVERLAY_SURFACE,
  POPUP_MOTION,
  FOCUS_RING_INSET,
].join(' ')

/** The palette's focus mark (DECISIONS 2026-10-19): while the input has the focus, the hairline under the search row
 * is overdrawn by a --tc-ring line as thick as a ring, so the row keeps its height. A border keeps it under forced colours. */
export const COMMAND_SEARCH_FOCUS = 'after:absolute after:inset-x-0 after:-bottom-(--tc-line-width) after:hidden after:border-b-(length:--tc-ring-width) after:border-ring has-focus-visible:after:block'

/** The search row: the magnifying glass, then the input, with no box of its own. It never shrinks. */
export const COMMAND_SEARCH = `relative flex shrink-0 items-center gap-2.5 border-b-(length:--tc-line-width) border-line ps-3.5 pe-3 text-muted ${COMMAND_SEARCH_FOCUS}`

/** 40 px tall, 48 under a finger, and 16 px text, so a phone neither misses it nor zooms the page into it.
 * Borderless and with no ring: its focus is the line under its row, COMMAND_SEARCH_FOCUS. */
export const COMMAND_INPUT = 'h-control-md pointer-coarse:h-control-lg min-w-0 flex-1 bg-transparent px-2 text-base text-body outline-none placeholder:text-muted'

/** R-10.5-1: the scroll container, at most --tc-list-rows rows, gone when nothing matches. No gap: the
 * spacers count whole rows, so with one the list grew and slid 2 px for each row the window passed. */
export const COMMAND_LIST = `flex min-h-0 flex-col p-1.5 ${LIST_CAP} ${SCROLL_AREA} data-empty:hidden`

/** Every row is exactly one unit tall, a heading too, and 44 px at least under a finger: the spacers
 * stand for the rows that are not mounted by counting units, so the two can never drift apart. */
export const COMMAND_UNIT = 'h-(--tc-row-height) shrink-0 pointer-coarse:h-[max(var(--tc-row-height),var(--tc-target-coarse,44px))]'

/** The rows above or below the window, as many units as the --tc-list-rows the spacer sets on itself. */
export const COMMAND_SPACER = [
  'shrink-0 h-[calc(var(--tc-list-rows)*var(--tc-row-height))]',
  'pointer-coarse:h-[calc(var(--tc-list-rows)*max(var(--tc-row-height),var(--tc-target-coarse,44px)))]',
].join(' ')

/** A heading, at the foot of its unit so it sits on the rows it names. */
export const COMMAND_GROUP_LABEL = `flex items-end px-2.5 pb-0.5 text-xs font-medium text-muted ${COMMAND_UNIT}`

/** The active row: the soft fill, and a --tc-ring bar at its inline start as thick as a ring, which the keyboard
 * reads where the fill alone is under 3:1. Forced colours keep the system pair, and the bar in HighlightText. */
export const COMMAND_ACTIVE = [
  'data-highlighted:bg-primary-soft data-highlighted:text-primary-on-soft',
  'before:absolute before:inset-y-1.5 before:inset-s-0 before:hidden before:border-s-(length:--tc-ring-width) before:border-ring data-highlighted:before:block',
  'forced-colors:data-highlighted:forced-color-adjust-none forced-colors:data-highlighted:bg-[Highlight]',
  'forced-colors:data-highlighted:text-[HighlightText] forced-colors:data-highlighted:before:border-[HighlightText]',
].join(' ')

/** The Enter hint at the end of the active row only, as muted mono text from the labels, and never under a finger. */
export const COMMAND_ENTER_HINT = 'after:ms-auto after:hidden after:shrink-0 after:font-mono after:text-xs after:text-muted after:content-(--tc-command-enter) data-highlighted:after:inline pointer-coarse:data-highlighted:after:hidden'

/** One command. Its label truncates, so a long one never widens the popup. The active row is the
 * highlighted one, filled and marked by COMMAND_ACTIVE: the focus stays in the input. */
export const COMMAND_ITEM = `relative ${ROW} ${COMMAND_ACTIVE} ${DISABLED} ${COMMAND_UNIT} ${CONTAIN} ${COMMAND_ENTER_HINT} select-none`

/** The Esc keycap at the end of the search row: a hint for a keyboard, so a finger never sees it. */
export const COMMAND_ESCAPE_HINT = 'shrink-0 border-line text-muted pointer-coarse:hidden'

/** The empty and the loading text. Base UI keeps the element mounted to announce it, so it takes no room while empty. */
export const COMMAND_STATUS = 'px-4 py-6 text-center text-sm text-muted empty:p-0'

/** The title only a screen reader reads: the popup is named by it. */
export const COMMAND_TITLE = 'sr-only'
