'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import type { CollectionProps } from '../contracts/collection.js'
import { useCollectionDefaults } from '../provider/context.js'
import { getWindow, offsetForIndex, shouldLoadMore, type WindowResult } from './window.js'

export type ScrollBlock = 'start' | 'center' | 'nearest'

export interface UseCollectionResult<T> {
  /** Attach to the scroll container. */
  scrollRef: (node: HTMLElement | null) => void
  /** Measure a row, so a tall one stops being estimated. */
  rowRef: (index: number) => (node: HTMLElement | null) => void
  /** The rows to render, each with its index and key. */
  rows: { item: T; index: number; key: string }[]
  /** Spacers above and below, so the scrollbar matches the full list. */
  paddingStart: number
  paddingEnd: number
  totalHeight: number
  totalCount: number
  virtualized: boolean
  scrollToIndex: (index: number, block?: ScrollBlock) => void
  scrollToKey: (key: string, block?: ScrollBlock) => void
}

const EMPTY: WindowResult = { start: 0, end: 0, paddingStart: 0, paddingEnd: 0, totalHeight: 0 }

/** useLayoutEffect warns during a server render, and there is nothing to measure there. */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function useCollection<T>(props: CollectionProps<T>): UseCollectionResult<T> {
  const defaults = useCollectionDefaults()
  const {
    items,
    getKey,
    virtualize = 'auto',
    estimateRowHeight = defaults.estimateRowHeight,
    hasMore = false,
    loadMore,
    loadMoreThreshold = defaults.loadMoreThreshold,
  } = props

  const count = items.length
  const virtualized =
    virtualize === true || (virtualize === 'auto' && count > defaults.virtualizeAbove)

  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)
  const [measured, setMeasured] = useState<ReadonlyMap<number, number>>(() => new Map())

  const containerRef = useRef<HTMLElement | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)

  const scrollRef = useCallback((node: HTMLElement | null) => {
    containerRef.current = node
    if (!node) return
    setViewportHeight(node.clientHeight)
    setScrollTop(node.scrollTop)
  }, [])

  useIsomorphicLayoutEffect(() => {
    const node = containerRef.current
    if (!node || !virtualized) return undefined

    const onScroll = () => { setScrollTop(node.scrollTop) }
    node.addEventListener('scroll', onScroll, { passive: true })

    const ro = new ResizeObserver(() => { setViewportHeight(node.clientHeight) })
    ro.observe(node)
    observerRef.current = ro

    return () => {
      node.removeEventListener('scroll', onScroll)
      ro.disconnect()
      observerRef.current = null
    }
  }, [virtualized])

  const rowRef = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      if (!node) return
      const height = node.getBoundingClientRect().height
      if (height <= 0) return
      setMeasured((prev) => {
        if (prev.get(index) === height) return prev
        const next = new Map(prev)
        next.set(index, height)
        return next
      })
    },
    [],
  )

  const windowed = useMemo(() => {
    if (!virtualized) return EMPTY
    return getWindow({
      scrollTop,
      viewportHeight,
      count,
      estimateRowHeight,
      overscan: defaults.overscan,
      measured,
    })
  }, [virtualized, scrollTop, viewportHeight, count, estimateRowHeight, defaults.overscan, measured])

  const start = virtualized ? windowed.start : 0
  const end = virtualized ? windowed.end : count

  // A duplicate key would make React reuse the wrong row, so the second is dropped.
  const rows = useMemo(() => {
    const seen = new Set<string>()
    const out: { item: T; index: number; key: string }[] = []
    for (let i = start; i < end; i++) {
      const item = items[i]
      if (item === undefined) continue
      const key = getKey(item)
      if (seen.has(key)) {
        if (process.env['NODE_ENV'] !== 'production') {
          console.warn(`useCollection: duplicate key "${key}" at index ${String(i)}; the row was dropped.`)
        }
        continue
      }
      seen.add(key)
      out.push({ item, index: i, key })
    }
    return out
  }, [items, getKey, start, end])

  // Asked once per page: the guard only clears when items grows or the promise rejects.
  const askedAt = useRef(-1)
  useEffect(() => {
    if (!loadMore || !shouldLoadMore(end, count, loadMoreThreshold, hasMore)) return
    if (askedAt.current === count) return
    askedAt.current = count
    void Promise.resolve(loadMore()).catch(() => { askedAt.current = -1 })
  }, [loadMore, end, count, loadMoreThreshold, hasMore])

  const scrollToIndex = useCallback(
    (index: number, block: ScrollBlock = 'nearest') => {
      const node = containerRef.current
      if (!node) return
      node.scrollTop = offsetForIndex(index, {
        count,
        viewportHeight: node.clientHeight,
        estimateRowHeight,
        overscan: defaults.overscan,
        measured,
        block,
      })
    },
    [count, estimateRowHeight, defaults.overscan, measured],
  )

  const scrollToKey = useCallback(
    (key: string, block: ScrollBlock = 'nearest') => {
      const index = items.findIndex((item) => getKey(item) === key)
      if (index >= 0) scrollToIndex(index, block)
    },
    [items, getKey, scrollToIndex],
  )

  return {
    scrollRef,
    rowRef,
    rows,
    paddingStart: virtualized ? windowed.paddingStart : 0,
    paddingEnd: virtualized ? windowed.paddingEnd : 0,
    totalHeight: virtualized ? windowed.totalHeight : 0,
    totalCount: count,
    virtualized,
    scrollToIndex,
    scrollToKey,
  }
}
