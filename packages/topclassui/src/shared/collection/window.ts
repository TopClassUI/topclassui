// The windowing maths with no React in it, so what R-8.5-1 promises is testable alone.

export interface WindowInput {
  scrollTop: number
  viewportHeight: number
  count: number
  estimateRowHeight: number
  overscan: number
  /** Heights of rows that have been measured, by index. Unmeasured rows use the estimate. */
  measured?: ReadonlyMap<number, number> | undefined
}

export interface WindowResult {
  /** First rendered index, inclusive. */
  start: number
  /** Last rendered index, exclusive. */
  end: number
  /** Spacer above the rendered rows, in pixels. */
  paddingStart: number
  /** Spacer below the rendered rows, in pixels. */
  paddingEnd: number
  totalHeight: number
}

function heightOf(index: number, estimate: number, measured?: ReadonlyMap<number, number>) {
  const m = measured?.get(index)
  return m !== undefined && m > 0 ? m : estimate
}

/** Running start offset of every row, plus the total as the last entry. */
function offsets(count: number, estimate: number, measured?: ReadonlyMap<number, number>) {
  const starts: number[] = new Array<number>(count + 1)
  starts[0] = 0
  let running = 0
  for (let i = 0; i < count; i++) {
    running += heightOf(i, estimate, measured)
    starts[i + 1] = running
  }
  return starts
}

/** Reads inside a computed bound, with a defined answer at the edges rather than an assertion. */
function startAt(starts: readonly number[], index: number): number {
  const last = starts.length - 1
  if (last < 0) return 0
  const i = index < 0 ? 0 : index > last ? last : index
  return starts[i] ?? 0
}

/** Index of the last row whose start is at or before `offset`. */
function indexAt(starts: readonly number[], offset: number) {
  let lo = 0
  let hi = starts.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (startAt(starts, mid) <= offset) lo = mid
    else hi = mid - 1
  }
  return lo
}

/**
 * Which rows to render for a scroll position. Below the virtualize threshold a caller
 * does not use this at all, and every row is plain DOM.
 */
export function getWindow(input: WindowInput): WindowResult {
  const { count, viewportHeight } = input
  const estimate = Math.max(1, input.estimateRowHeight)
  const overscan = Math.max(0, input.overscan)

  if (count <= 0) return { start: 0, end: 0, paddingStart: 0, paddingEnd: 0, totalHeight: 0 }

  const starts = offsets(count, estimate, input.measured)
  const totalHeight = startAt(starts, count)
  const scrollTop = Math.min(Math.max(0, input.scrollTop), Math.max(0, totalHeight - viewportHeight))

  const first = indexAt(starts, scrollTop)
  const last = indexAt(starts, scrollTop + Math.max(0, viewportHeight))

  const start = Math.max(0, first - overscan)
  const end = Math.min(count, last + 1 + overscan)

  return {
    start,
    end,
    paddingStart: startAt(starts, start),
    paddingEnd: totalHeight - startAt(starts, end),
    totalHeight,
  }
}

/** Scroll offset that brings a row into view, for scrollToIndex and scrollToKey. `nearest` reads
 * `scrollTop`: a row above the view goes to the top edge, one below to the bottom, one in view stays. */
export function offsetForIndex(
  index: number,
  input: WindowInput & { block?: 'start' | 'center' | 'nearest' },
): number {
  const { count, viewportHeight, scrollTop, block = 'nearest' } = input
  const estimate = Math.max(1, input.estimateRowHeight)
  if (count <= 0) return 0

  const clamped = Math.min(Math.max(0, index), count - 1)
  const starts = offsets(count, estimate, input.measured)
  const rowStart = startAt(starts, clamped)
  const rowHeight = heightOf(clamped, estimate, input.measured)
  const maxScroll = Math.max(0, startAt(starts, count) - viewportHeight)
  const within = (offset: number) => Math.min(Math.max(0, offset), maxScroll)

  if (block === 'start') return within(rowStart)
  if (block === 'center') return within(rowStart - (viewportHeight - rowHeight) / 2)
  if (rowStart < scrollTop) return within(rowStart)
  if (rowStart + rowHeight > scrollTop + viewportHeight) return within(rowStart + rowHeight - viewportHeight)
  return scrollTop
}

/** R-8.5-1: ask for the next page once, when the window is within the threshold of the end. */
export function shouldLoadMore(end: number, count: number, threshold: number, hasMore: boolean) {
  if (!hasMore || count <= 0) return false
  return count - end <= Math.max(0, threshold)
}
