// R-8.3-2: the value lists, the defaults and what each sort direction shows. The bounds live in boundaries.ts.
import { caretDown } from '#icons/data/caret-down.js'
import { caretUp } from '#icons/data/caret-up.js'
import type { IconData } from '#icons/types.js'
import type { Labels } from '#shared/labels/types.js'

export const TABLE_ALIGNS = ['start', 'end'] as const

/** Spelled as aria-sort spells them, so the prop is the attribute. */
export const TABLE_SORT_DIRECTIONS = ['ascending', 'descending'] as const

/** Every design prop's starting value. A caller overrides any of them by passing the prop. */
export const TABLE_DEFAULTS = {
  captionVisible: false,
  striped: false,
  stickyFirstColumn: false,
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

/** The caret of the sorted column: up for the smallest value first. */
export const SORT_ICONS: Record<(typeof TABLE_SORT_DIRECTIONS)[number], IconData> = {
  ascending: caretUp,
  descending: caretDown,
}

/** The key under `labels.table` that says each direction in words. */
export const SORT_LABELS = {
  ascending: 'sortedAscending',
  descending: 'sortedDescending',
} as const satisfies Record<(typeof TABLE_SORT_DIRECTIONS)[number], keyof Labels['table']>
