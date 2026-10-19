// R-5.12-4: one class string per element TreeView styles, built from the shared constants.
import { BORDER, FORCED_EDGE, HOVER, LABEL, POINTER, SCROLL_AREA, TRANSITION } from '#shared/classes.js'

/** The box: one column, so the tree scrolls inside it and never widens its parent. No gap: the note brings its own room. */
export const TREE_VIEW_ROOT = 'grid min-w-0 grid-cols-1'

/** The one tab stop and the scroll container; its own ring shows while no row holding the highlight is mounted or in
 * sight. No gap: the spacers count whole rows. With no row it is not drawn, so no empty tree is announced or outlined. */
export const TREE_VIEW_TREE = [
  'group/tree relative flex flex-col rounded-box bg-surface-raised p-2 outline-none tone-neutral empty:hidden',
  'focus-visible:not-has-data-highlighted:outline-solid focus-visible:not-has-data-highlighted:outline-(length:--tc-ring-width) focus-visible:not-has-data-highlighted:-outline-offset-(length:--tc-ring-width) focus-visible:not-has-data-highlighted:outline-ring',
  'focus-visible:data-highlight-hidden:outline-solid focus-visible:data-highlight-hidden:outline-(length:--tc-ring-width) focus-visible:data-highlight-hidden:-outline-offset-(length:--tc-ring-width) focus-visible:data-highlight-hidden:outline-ring',
  'max-h-[calc(var(--tc-list-rows)*var(--tc-row-height)+1rem+2*var(--tc-line-width))]',
  'pointer-coarse:max-h-[calc(var(--tc-list-rows)*max(var(--tc-row-height),var(--tc-target-coarse,44px))+1rem+2*var(--tc-line-width))]',
  'before:h-(--tc-list-pad-start) before:shrink-0 after:h-(--tc-list-pad-end) after:shrink-0',
  BORDER,
  SCROLL_AREA,
].join(' ')

/** Exactly one unit tall, the shared 32 px row, 44 px under a finger. The start padding grows by one indent per level. */
export const TREE_VIEW_ROW = [
  'group/row flex h-(--tc-row-height) shrink-0 select-none items-center gap-1.5 rounded-control text-start text-sm text-body',
  'pe-2 ps-[calc(0.5rem+var(--tc-tree-level)*var(--tc-tree-indent))]',
  'pointer-coarse:h-[max(var(--tc-row-height),var(--tc-target-coarse,44px))]',
  HOVER.ghost,
  POINTER,
  TRANSITION,
].join(' ')

/** Selected: the tint at the previewer's regular weight, and under forced colours the system pair. */
export const TREE_VIEW_ROW_SELECTED = 'aria-selected:bg-primary-soft aria-selected:text-primary-on-soft forced-colors:aria-selected:forced-color-adjust-none forced-colors:aria-selected:bg-[Highlight] forced-colors:aria-selected:text-[HighlightText]'

/** The row the keys are on, while the tree has the keyboard: a ring just outside the row, as drawn, inside the tree's
 * 8 px padding and its scroll padding. On a selected row under forced colours it is set to HighlightText. */
export const TREE_VIEW_ROW_ACTIVE = 'group-focus-visible/tree:data-highlighted:outline-solid group-focus-visible/tree:data-highlighted:outline-(length:--tc-ring-width) group-focus-visible/tree:data-highlighted:outline-offset-(length:--tc-ring-offset) group-focus-visible/tree:data-highlighted:outline-ring forced-colors:aria-selected:group-focus-visible/tree:data-highlighted:outline-[HighlightText]'

export const TREE_VIEW_ROW_DISABLED = 'aria-disabled:pointer-events-none aria-disabled:opacity-50'

/** The caret, or an empty slot as wide on a leaf. Colour on the wrapper, never on the svg; on a selected row under
 * forced colours it inherits the row's adjust-none, so it is set to HighlightText by hand. */
export const TREE_VIEW_CARET = 'flex size-3 shrink-0 items-center justify-center text-body group-aria-selected/row:text-primary-on-soft forced-colors:group-aria-selected/row:text-[HighlightText]'

export const TREE_VIEW_ICON = 'flex shrink-0 text-body group-aria-selected/row:text-primary-on-soft forced-colors:group-aria-selected/row:text-[HighlightText]'

/** Not flex-1: in an RTL row a dir=auto Latin label would sit at the far edge, away from its caret. */
export const TREE_VIEW_LABEL = LABEL

/** The loading and the empty text, outside the tree. A live region stays in the page so its first words are read; empty, it takes no room. */
export const TREE_VIEW_NOTE = 'px-3 py-2 text-sm text-muted empty:p-0'

/** R-5.2-3: the status line's own look per kind. Loading draws bars in the tree's box, empty the tray over its words. */
export const TREE_VIEW_NOTE_KIND = {
  idle: '',
  own: '',
  loading: `flex flex-col gap-3 rounded-box bg-surface-raised p-4 ${BORDER}`,
  'loading-more': 'flex flex-col gap-3',
  empty: `flex flex-col items-center gap-2 rounded-box bg-surface-raised p-6 text-center ${BORDER}`,
} as const

/** The words of a loading line, while bars stand for them: still read by the live region, never seen. */
export const TREE_VIEW_NOTE_TEXT = { idle: '', own: '', loading: 'sr-only', 'loading-more': 'sr-only', empty: '' } as const

/** Two bars, 100 and 80 px as drawn, in Skeleton's fill and pulse. */
export const TREE_VIEW_SKELETON_BAR = `block h-2 rounded-chip bg-neutral-soft animate-pulse motion-reduce:animate-none ${FORCED_EDGE}`

export const TREE_VIEW_SKELETON_WIDTHS = ['w-25', 'w-20'] as const
