// R-8.3-2: the value lists and the defaults. The bounds are the shared COLLECTION_BOUNDARIES.

/** What the tree is doing besides showing its rows: the first page or the next is on its way, or there is nothing. */
export const TREE_VIEW_STATUSES = ['idle', 'loading', 'loading-more', 'empty'] as const

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const TREE_VIEW_DEFAULTS = {
  defaultValue: null,
  defaultExpanded: [],
  // The --tc-list-rows knob, which applies whenever the prop is left out.
  visibleRows: 7,
  virtualize: 'auto',
  hasMore: false,
  loadMoreThreshold: 10,
  status: 'idle',
} as const

/** Letters typed within this many ms of each other are one query for the type-ahead. */
export const TYPEAHEAD_MS = 500

/** A row before it is measured: --tc-row-height is 40 px at a density of 1. The tree then measures its first row. */
export const TREE_VIEW_ROW_ESTIMATE = 40

/** The placeholder's starting rows: a short tree, under the seven the --tc-list-rows knob shows before it scrolls. */
export const TREE_VIEW_SKELETON_DEFAULTS = {
  rows: 5,
} as const

/** The level of each placeholder row in turn, repeating: a branch open on two leaves, then two roots, so it reads as a tree. */
export const TREE_VIEW_SKELETON_LEVELS = [0, 1, 1, 0, 0] as const
