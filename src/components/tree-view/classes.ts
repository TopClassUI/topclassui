// R-5.12-4: one class string per element TreeView styles, built from the shared constants.
import { BORDER, HOVER, LABEL, SCROLL_AREA, TRANSITION } from '#shared/classes.js'

/** The box: one column, so the tree scrolls inside it and never widens its parent. No gap: the note brings its own room. */
export const TREE_VIEW_ROOT = 'grid min-w-0 grid-cols-1'

/** The one tab stop and the scroll container; its own ring shows while no row holding the highlight is mounted or in
 * sight. No gap: the spacers count whole rows. With no row it is not drawn, so no empty tree is announced or outlined. */
export const TREE_VIEW_TREE = [
  'group/tree relative flex flex-col rounded-box bg-surface-raised p-2 outline-none tone-neutral empty:hidden',
  'focus-visible:not-has-data-highlighted:outline-solid focus-visible:not-has-data-highlighted:outline-(length:--tc-ring-width) focus-visible:not-has-data-highlighted:-outline-offset-(length:--tc-ring-width) focus-visible:not-has-data-highlighted:outline-ring',
  'focus-visible:data-highlight-hidden:outline-solid focus-visible:data-highlight-hidden:outline-(length:--tc-ring-width) focus-visible:data-highlight-hidden:-outline-offset-(length:--tc-ring-width) focus-visible:data-highlight-hidden:outline-ring',
  'max-h-[calc(var(--tc-list-rows)*var(--tc-row-height))]',
  'pointer-coarse:max-h-[calc(var(--tc-list-rows)*max(var(--tc-row-height),var(--tc-target-coarse,44px)))]',
  'before:h-(--tc-list-pad-start) before:shrink-0 after:h-(--tc-list-pad-end) after:shrink-0',
  BORDER,
  SCROLL_AREA,
].join(' ')

/** Exactly one unit tall, 44 px under a finger. The start padding grows by one indent per level. */
export const TREE_VIEW_ROW = [
  'group/row flex h-(--tc-row-height) shrink-0 cursor-default select-none items-center gap-1.5 rounded-control text-start text-sm text-body',
  'pe-2 ps-[calc(0.5rem+var(--tc-tree-level)*var(--tc-tree-indent))]',
  'pointer-coarse:h-[max(var(--tc-row-height),var(--tc-target-coarse,44px))]',
  HOVER.ghost,
  TRANSITION,
].join(' ')

/** Selected: the tint, a heavier weight, and under forced colours the system pair. */
export const TREE_VIEW_ROW_SELECTED = 'aria-selected:bg-primary-soft aria-selected:font-medium aria-selected:text-primary-on-soft forced-colors:aria-selected:forced-color-adjust-none forced-colors:aria-selected:bg-[Highlight] forced-colors:aria-selected:text-[HighlightText]'

/** The row the keys are on, while the tree has the keyboard: a ring inside the row, since the tree draws none. On a
 * selected row under forced colours the ring keeps no system colour of its own, so it is set to HighlightText. */
export const TREE_VIEW_ROW_ACTIVE = 'group-focus-visible/tree:data-highlighted:outline-solid group-focus-visible/tree:data-highlighted:outline-(length:--tc-ring-width) group-focus-visible/tree:data-highlighted:-outline-offset-(length:--tc-ring-width) group-focus-visible/tree:data-highlighted:outline-ring forced-colors:aria-selected:group-focus-visible/tree:data-highlighted:outline-[HighlightText]'

export const TREE_VIEW_ROW_DISABLED = 'aria-disabled:pointer-events-none aria-disabled:opacity-50'

/** The caret, or an empty slot as wide on a leaf. Colour on the wrapper, never on the svg; on a selected row under
 * forced colours it inherits the row's adjust-none, so it is set to HighlightText by hand. */
export const TREE_VIEW_CARET = 'flex size-3.5 shrink-0 items-center justify-center text-muted group-aria-selected/row:text-primary-on-soft forced-colors:group-aria-selected/row:text-[HighlightText]'

export const TREE_VIEW_ICON = 'flex shrink-0 text-muted group-aria-selected/row:text-primary-on-soft forced-colors:group-aria-selected/row:text-[HighlightText]'

export const TREE_VIEW_LABEL = `${LABEL} flex-1`

/** The loading and the empty text, outside the tree. A live region stays in the page so its first words are read; empty, it takes no room. */
export const TREE_VIEW_NOTE = 'px-3 py-2 text-sm text-muted empty:p-0'
