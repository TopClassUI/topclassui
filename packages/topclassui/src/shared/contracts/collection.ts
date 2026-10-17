import type { StateProps } from './state.js'

/** R-8.5-1: every component that renders items takes these, so behaviour is identical everywhere. */
export interface CollectionProps<T> extends StateProps {
  items: readonly T[]
  /** Stable identity across pages, so a row keeps its place when a page is prepended. Client-only. */
  getKey: (item: T) => string
  /** Rows before scrolling; defaults to the --tc-list-rows knob. */
  visibleRows?: number | undefined
  /** 'auto' turns windowing on above virtualizeAbove. */
  virtualize?: 'auto' | boolean | undefined
  estimateRowHeight?: number | undefined
  hasMore?: boolean | undefined
  /** Client-only, or a Server Action. Called once when the window nears the end. */
  loadMore?: (() => void | Promise<void>) | undefined
  loadMoreThreshold?: number | undefined
  /** The selected value's item when it is not in the loaded pages, so the trigger is never blank. */
  selectedItem?: T | undefined
}

export interface CollectionDefaults {
  visibleRows: number
  virtualizeAbove: number
  loadMoreThreshold: number
  estimateRowHeight: number
  overscan: number
}

/** Typed rather than `as const`, or the override prop would only accept these exact numbers. */
export const COLLECTION_DEFAULTS: CollectionDefaults = {
  visibleRows: 7,
  virtualizeAbove: 200,
  loadMoreThreshold: 10,
  estimateRowHeight: 36,
  overscan: 6,
}

/** R-5.7-7: the bounds of the two numeric props every collection takes, so no folder copies them. A component
 * clamps with them and its schema names the same numbers. loadMoreThreshold counts rows, not pixels. */
export const COLLECTION_BOUNDARIES = {
  visibleRowsMin: 1,
  visibleRowsMax: 20,
  loadMoreThresholdMin: 0,
  loadMoreThresholdMax: 200,
} as const
