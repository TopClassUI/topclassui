'use client'

import { useCallback } from 'react'

import { useCollection } from '#shared/collection/use-collection.js'
import { keyOfRow } from './lib.js'
import type { TableRowsProps } from './types.js'

const px = (length: number) => (length > 0 ? `${String(length)}px` : undefined)

/** The body rows through the shared collection (R-8.5-1): the window, the spacers, and a page asked at the end. The
 * rows scroll in the region the server drew around the table, which the body finds as its nearest region. */
export function useTableRows({ rows, virtualize, visibleRows, hasMore, loadMore, loadMoreThreshold }: TableRowsProps) {
  const collection = useCollection({ items: rows, getKey: keyOfRow, virtualize, visibleRows, hasMore, loadMore, loadMoreThreshold })
  const { scrollRef } = collection
  const bodyRef = useCallback((node: HTMLTableSectionElement | null) => {
    const region = node?.closest('[role="region"]')
    scrollRef(region instanceof HTMLElement ? region : null)
  }, [scrollRef])
  return {
    bodyRef,
    // Measured only while windowed: the spacers stand for rows taller than the estimate.
    rowRef: collection.virtualized ? collection.rowRef : undefined,
    rows: collection.rows,
    style: { '--tc-list-pad-start': px(collection.paddingStart), '--tc-list-pad-end': px(collection.paddingEnd) },
    spacers: { start: collection.paddingStart > 0, end: collection.paddingEnd > 0 },
  }
}
