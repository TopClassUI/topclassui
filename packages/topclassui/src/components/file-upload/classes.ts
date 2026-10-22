// R-5.12-4: the class strings of the file upload, built from the shared constants (unit-5.md, FileUpload).
import {
  BORDER, BORDER_STRONG, CONTAIN, DISABLED, FIELD_INVALID_WITHIN, FOCUS_RING_INSET, FOCUS_RING_WITHIN, HOVER, ICON_BUTTON, LABEL, ROW_TOUCH,
  SCROLL_AREA, TRANSITION,
} from '#shared/classes.js'

/** One column, so the list scrolls instead of widening its parent. relative: it holds the hidden status line. */
export const FILE_UPLOAD_ROOT = 'relative grid min-w-0 grid-cols-1 gap-2.5 text-body'

/** The ring shows when the input over the zone has the keyboard; the dashed 3:1 line, danger when invalid. A drag turns
 * the dashed line, the fill and the words primary, as drawn; forced colours erase those, so there the line turns solid.
 * Compact is the frame's mini zone: 12 px of padding and 4 between the icon and the word. */
export const FILE_UPLOAD_ZONE = `group/zone relative flex flex-col items-center justify-center gap-2 rounded-box border-dashed bg-surface p-6 text-center data-compact:gap-1 data-compact:p-3 ${BORDER_STRONG} ${TRANSITION} ${FOCUS_RING_WITHIN} ${FIELD_INVALID_WITHIN} data-disabled:opacity-50 data-dragging:border-primary-solid forced-colors:data-dragging:border-solid data-dragging:bg-primary-soft data-dragging:text-primary-on-soft forced-colors:data-dragging:border-[Highlight]`

/** The native input over the whole zone, unseen: a click, a key and a drop reach it before any script. */
export const FILE_UPLOAD_INPUT = 'absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-default'

export const FILE_UPLOAD_ICON = 'flex text-muted group-data-dragging/zone:text-primary-on-soft'

/** CONTAIN and wrap-anywhere: a word with no space to break at wraps inside the zone instead of widening the page. */
export const FILE_UPLOAD_PROMPT = `flex flex-wrap justify-center gap-x-1 text-sm group-data-compact/zone:text-xs group-data-compact/zone:font-normal font-medium wrap-anywhere ${CONTAIN}`

/** The drop words before browse; a compact zone shows the browse word alone, as the frame's mini zone does. */
export const FILE_UPLOAD_DROP = 'group-data-compact/zone:hidden'

/** One line with the drop words, as drawn: the whole zone is the control, so the word needs no link styling. */
export const FILE_UPLOAD_BROWSE = 'text-body group-data-dragging/zone:text-primary-on-soft'

/** As the prompt; a link or a button in it is lifted over the input, which takes every other pointer on the zone. */
export const FILE_UPLOAD_HINT = `text-xs text-muted group-data-dragging/zone:text-primary-on-soft wrap-anywhere ${CONTAIN} [&_a,&_button]:relative [&_a,&_button]:z-1`

/** At most --tc-list-rows whole rows and their gaps, then it scrolls inside itself. A row is its remove or its name with
 * padding and line, or --tc-row-height if taller, which ROW_TOUCH keeps under a coarse pointer. auto-rows-max: a row
 * never shrinks under its content. Nothing at all while empty. */
export const FILE_UPLOAD_LIST = `grid grid-cols-1 auto-rows-max gap-1.5 max-h-[calc(var(--tc-list-rows)*max(var(--tc-row-height),var(--tc-target-min,24px)+var(--spacing)*2+var(--tc-line-width)*2,var(--text-sm)*var(--text-sm--line-height)+var(--spacing)*2+var(--tc-line-width)*2)+(var(--tc-list-rows)-1)*var(--spacing)*1.5)] pointer-coarse:max-h-[calc(var(--tc-list-rows)*max(var(--tc-row-height),var(--tc-target-coarse,44px)+var(--spacing)*2+var(--tc-line-width)*2,var(--text-sm)*var(--text-sm--line-height)+var(--spacing)*2+var(--tc-line-width)*2)+(var(--tc-list-rows)-1)*var(--spacing)*1.5)] empty:hidden ${SCROLL_AREA} ${FOCUS_RING_INSET}`

/** The rows the window left out above and below, with their gaps, as tall as the hook measured them. */
export const FILE_UPLOAD_SPACER_START = 'h-(--tc-list-pad-start)'
export const FILE_UPLOAD_SPACER_END = 'h-(--tc-list-pad-end)'

export const FILE_UPLOAD_ROW = `flex min-h-(--tc-row-height) min-w-0 items-center gap-2.5 rounded-control px-3 py-1 text-sm ${BORDER} ${ROW_TOUCH}`

export const FILE_UPLOAD_ROW_ICON = 'flex shrink-0 text-muted'

export const FILE_UPLOAD_REJECTED_ICON = 'flex shrink-0 text-danger-on-soft'

export const FILE_UPLOAD_NAME = `${LABEL} flex-1 font-medium`

export const FILE_UPLOAD_SIZE = 'shrink-0 text-xs text-muted tabular-nums'

/** Muted: the icon before it carries the danger hue, as the frame draws it. */
export const FILE_UPLOAD_REASON = 'shrink-0 text-xs text-muted'

/** The x: an icon button on the neutral ramp, as Popover's close, dimmed with the upload when it is disabled. */
export const FILE_UPLOAD_REMOVE = `${ICON_BUTTON} text-muted tone-neutral ${HOVER.ghost} ${DISABLED}`

/** Out of the grid while empty, and still in the accessibility tree: a live region that is display none is not heard. */
export const FILE_UPLOAD_MESSAGE = 'text-sm text-danger-on-soft empty:sr-only'

/** The refusals, read and not seen: each row already shows its reason. */
export const FILE_UPLOAD_ANNOUNCE = 'sr-only'
