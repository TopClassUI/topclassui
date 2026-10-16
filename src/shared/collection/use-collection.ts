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

/** A computed length in px; `auto` and an empty value are 0. */
const px = (value: string) => Number.parseFloat(value) || 0

/** Where the first row starts inside the list, and the room scroll-padding keeps at each edge. */
function edgesOf(node: HTMLElement) {
  const style = getComputedStyle(node)
  return { padding: px(style.paddingTop), start: px(style.scrollPaddingTop), end: px(style.scrollPaddingBottom) }
}

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
  // Starts true: with no measured container we cannot rule out being at the end.
  const [atEnd, setAtEnd] = useState(true)
  // A version counter, not a new Map per row: copying it made scrolling quadratic.
  const measuredRef = useRef<Map<number, number>>(new Map())
  const [measuredVersion, setMeasuredVersion] = useState(0)

  // State, not a ref: the effect has to rebind when the container node is replaced.
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const containerRef = useRef<HTMLElement | null>(null)

  const scrollRef = useCallback((node: HTMLElement | null) => {
    containerRef.current = node
    setContainer(node)
  }, [])

  /** How close to the bottom counts as the end, in pixels. */
  const reach = Math.max(0, loadMoreThreshold) * estimateRowHeight

  useIsomorphicLayoutEffect(() => {
    if (!container) return undefined

    const read = () => {
      setScrollTop(container.scrollTop)
      setViewportHeight(container.clientHeight)
      const slack = container.scrollHeight - container.scrollTop - container.clientHeight
      setAtEnd(container.clientHeight === 0 || slack <= reach)
    }

    read()
    container.addEventListener('scroll', read, { passive: true })
    const ro = new ResizeObserver(read)
    ro.observe(container)

    return () => {
      container.removeEventListener('scroll', read)
      ro.disconnect()
    }
  }, [container, reach])

  const rowRef = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      if (!node) return
      const height = node.getBoundingClientRect().height
      if (height <= 0) return
      if (measuredRef.current.get(index) === height) return
      measuredRef.current.set(index, height)
      setMeasuredVersion((v) => v + 1)
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
      measured: measuredRef.current,
    })
  }, [virtualized, scrollTop, viewportHeight, count, estimateRowHeight, defaults.overscan, measuredVersion])

  const start = virtualized ? windowed.start : 0
  const end = virtualized ? windowed.end : count

  const warnedKeys = useRef<Set<string>>(new Set())

  // A duplicate key would make React reuse the wrong row, so the second is dropped.
  const rows = useMemo(() => {
    const seen = new Set<string>()
    const out: { item: T; index: number; key: string }[] = []
    for (let i = start; i < end; i++) {
      const item = items[i]
      if (item === undefined) continue
      const key = getKey(item)
      if (seen.has(key)) {
        // Warned once per key, not once per render: this memo recomputes on every scroll.
        if (process.env.NODE_ENV !== 'production' && !warnedKeys.current.has(key)) {
          warnedKeys.current.add(key)
          console.warn(`useCollection: duplicate key "${key}" at index ${String(i)}; the row was dropped.`)
        }
        continue
      }
      seen.add(key)
      out.push({ item, index: i, key })
    }
    return out
  }, [items, getKey, start, end])

  // Unvirtualized, count - end is always 0, so only the scroll position can stop the asking.
  const wantsMore = virtualized
    ? shouldLoadMore(end, count, loadMoreThreshold, hasMore)
    : hasMore && atEnd

  // Asked once per page: the guard only clears when items grows or the promise rejects.
  const askedAt = useRef(-1)
  useEffect(() => {
    if (!loadMore || !wantsMore) return
    if (askedAt.current === count) return
    askedAt.current = count
    void Promise.resolve(loadMore()).catch(() => { askedAt.current = -1 })
  }, [loadMore, wantsMore, count])

  const scrollToIndex = useCallback(
    (index: number, block: ScrollBlock = 'nearest') => {
      const node = containerRef.current
      if (!node) return
      const edge = edgesOf(node)
      // The rows start below the list's own padding, and the edges are where scroll-padding puts them, as scrollIntoView does.
      const shift = edge.padding - edge.start
      node.scrollTop = shift + offsetForIndex(index, {
        scrollTop: node.scrollTop - shift,
        count,
        viewportHeight: Math.max(0, node.clientHeight - edge.start - edge.end),
        estimateRowHeight,
        overscan: defaults.overscan,
        measured: measuredRef.current,
        block,
      })
    },
    [count, estimateRowHeight, defaults.overscan, measuredVersion],
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
