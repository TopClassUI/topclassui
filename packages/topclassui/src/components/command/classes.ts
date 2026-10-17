// R-5.12-4: one class string per element Command styles, built from the shared overlay constants.
import {
  CONTAIN, DISABLED, FADE_MOTION, FOCUS_RING_INSET, LIST_CAP, OVERLAY_SURFACE, POPUP_MOTION, ROW, ROW_HIGHLIGHT, SCRIM,
  SCROLL_AREA,
} from '#shared/classes.js'

/** The scrim, on the dialog layer. It fades; the page behind is locked by Base UI. */
export const COMMAND_BACKDROP = `${SCRIM} z-(--tc-z-dialog) ${FADE_MOTION}`

/** The whole screen. The popup hangs from 15% down rather than centring, so it stays put as the results change. */
export const COMMAND_VIEWPORT = 'fixed inset-0 z-(--tc-z-dialog) flex items-start justify-center p-(--tc-overlay-inset) pt-[15dvh]'

/** A column that ends the inset above the bottom, so the list is what gives way. No overflow-hidden:
 * it would cut the ring of the input. The popup's own ring is drawn inside it, never on the scrim. */
export const COMMAND_POPUP = [
  'flex max-h-[calc(85dvh-var(--tc-overlay-inset))] w-full max-w-105 flex-col wrap-anywhere',
  OVERLAY_SURFACE,
  POPUP_MOTION,
  FOCUS_RING_INSET,
].join(' ')

/** The search row: the magnifying glass, then the input. It never shrinks. */
export const COMMAND_SEARCH = 'flex shrink-0 items-center gap-2.5 border-b-(length:--tc-line-width) border-line px-4 text-muted'

/** 48 px tall and 16 px text, so a phone neither misses it nor zooms the page into it. The ring is
 * drawn inside, with room before the caret, since the row sits flush against the popup. */
export const COMMAND_INPUT = `h-control-lg min-w-0 flex-1 rounded-control bg-transparent px-2 text-base text-body placeholder:text-muted ${FOCUS_RING_INSET}`

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
export const COMMAND_GROUP_LABEL = `flex items-end px-3 pb-1 text-xs font-medium text-muted ${COMMAND_UNIT}`

/** One command. Its label truncates, so a long one never widens the popup. The active row is the
 * highlighted one, filled and ringed by ROW_HIGHLIGHT: the focus stays in the input. */
export const COMMAND_ITEM = `${ROW} ${ROW_HIGHLIGHT} ${DISABLED} ${COMMAND_UNIT} ${CONTAIN} cursor-default select-none`

/** The empty and the loading text. Base UI keeps the element mounted to announce it, so it takes no room while empty. */
export const COMMAND_STATUS = 'px-4 py-6 text-center text-sm text-muted empty:p-0'

/** The title only a screen reader reads: the popup is named by it. */
export const COMMAND_TITLE = 'sr-only'
