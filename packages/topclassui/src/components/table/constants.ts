// R-8.3-2: the value lists, the defaults and what each sort direction shows. The bounds live in boundaries.ts.
import { caretUpDown } from '#icons/data/caret-up-down.js'
import { sortAscending } from '#icons/data/sort-ascending.js'
import { sortDescending } from '#icons/data/sort-descending.js'
import type { IconData } from '#icons/types.js'
import { COLLECTION_DEFAULTS } from '#shared/contracts/collection.js'
import type { Labels } from '#shared/labels/types.js'

export const TABLE_ALIGNS = ['start', 'end'] as const

/** The frame's two row heights: its own, and a tighter one for long lists. */
export const TABLE_DENSITIES = ['comfortable', 'compact'] as const

/** The frame's two boxes: with the hairline round it, or without. */
export const TABLE_VARIANTS = ['outline', 'plain'] as const

/** Spelled as aria-sort spells them, so the prop is the attribute. */
export const TABLE_SORT_DIRECTIONS = ['ascending', 'descending'] as const

/** Every design prop's starting value. A caller overrides any of them by passing the prop. */
export const TABLE_DEFAULTS = {
  captionVisible: false,
  density: 'comfortable',
  variant: 'outline',
  striped: false,
  stickyFirstColumn: false,
  // The --tc-list-rows knob, which applies whenever the prop is left out.
  visibleRows: COLLECTION_DEFAULTS.visibleRows,
  virtualize: 'auto',
  loadMoreThreshold: COLLECTION_DEFAULTS.loadMoreThreshold,
} as const

/** What a column falls back to when it names no alignment. */
export const TABLE_COLUMN_DEFAULTS = {
  align: 'start',
} as const

/** The placeholder's starting shape: PLAN 8.2 writes its example with five rows. */
export const TABLE_SKELETON_DEFAULTS = {
  rows: 5,
  columns: 4,
} as const

/** The mark of the sorted column, as the frame draws it: the smallest value first is ascending. */
export const SORT_ICONS: Record<(typeof TABLE_SORT_DIRECTIONS)[number], IconData> = {
  ascending: sortAscending,
  descending: sortDescending,
}

/** The mark of a column that can be sorted and is not. */
export const SORT_IDLE_ICON: IconData = caretUpDown

/** The frame's header marks are 13 px, a pixel over the header's text. */
export const SORT_ICON_SIZE = 13

/** The key under `labels.table` that says each direction in words. */
export const SORT_LABELS = {
  ascending: 'sortedAscending',
  descending: 'sortedDescending',
} as const satisfies Record<(typeof TABLE_SORT_DIRECTIONS)[number], keyof Labels['table']>
