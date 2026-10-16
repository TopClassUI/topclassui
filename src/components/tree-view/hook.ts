'use client'

import { useCallback, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { clamp } from '#shared/clamp.js'
import { useCollection } from '#shared/collection/use-collection.js'
import { COLLECTION_BOUNDARIES } from '#shared/contracts/collection.js'
import { useDirection, useLabels } from '#shared/provider/context.js'
import { useControllableState } from '#shared/use-controllable-state.js'
import { TREE_VIEW_DEFAULTS, TREE_VIEW_ROW_ESTIMATE, TYPEAHEAD_MS } from './constants.js'
import { findRow, flattenTree, isScrolledOut, keyAction, keyOfRow, rowIndexOf, toggled, typeahead } from './lib.js'
import type {
  TreeFocusEvent, TreeKeyAction, TreeKeyEvent, TreeMouseEvent, TreePointerEvent, TreeViewHookProps,
} from './types.js'

const { visibleRowsMin, visibleRowsMax, loadMoreThresholdMin, loadMoreThresholdMax } = COLLECTION_BOUNDARIES

/** The selection, the open branches and the visible rows they leave, windowed by the shared hook (R-8.5-1), with the
 * row the keys are on kept in view. The focus stays on the tree; aria-activedescendant names a mounted row only. */
export function useTreeView(props: TreeViewHookProps) {
  const { items, hasMore = TREE_VIEW_DEFAULTS.hasMore, loadMore, status = TREE_VIEW_DEFAULTS.status } = props
  const [selected, setSelected] = useControllableState({
    value: props.value,
    defaultValue: props.defaultValue ?? TREE_VIEW_DEFAULTS.defaultValue,
    onChange: (id: string | null) => { if (id !== null) props.onValueChange?.(id) },
  })
  const [open, setOpen] = useControllableState({
    value: props.expanded, defaultValue: props.defaultExpanded ?? TREE_VIEW_DEFAULTS.defaultExpanded, onChange: props.onExpandedChange,
  })
  const rows = useMemo(() => flattenTree(items, open), [items, open])
  const [active, setActive] = useState(null as string | null)
  const [unit, setUnit] = useState(TREE_VIEW_ROW_ESTIMATE)
  const [outOfView, setOutOfView] = useState(false)
  // useCollection reads the tree on a scroll or a resize only: paging waits until it has read the tree at this count.
  const [counted, setCounted] = useState(-1)
  const given = useRef(false)
  const tree = useRef(null as HTMLDivElement | null)
  const pending = useRef(-1)
  // The row a pointer pressed, -1 off a row, until the focus it brings; null when no press is on its way.
  const pressed = useRef(null as number | null)
  const typed = useRef({ text: '', at: 0 })
  // A page is asked for once per length of the root list, so opening a branch near the end never asks for it again.
  const askedAt = useRef(-1)
  useImperativeHandle(props.ref, () => tree.current as HTMLDivElement, [])

  const ask = useCallback(() => {
    if (!loadMore || askedAt.current === items.length) return undefined
    askedAt.current = items.length
    return Promise.resolve(loadMore()).catch((error: unknown) => { askedAt.current = -1; throw error })
  }, [loadMore, items.length])

  const collection = useCollection({
    items: rows,
    getKey: keyOfRow,
    virtualize: props.virtualize ?? TREE_VIEW_DEFAULTS.virtualize,
    estimateRowHeight: unit,
    hasMore: hasMore && counted === rows.length,
    loadMore: loadMore ? ask : undefined,
    loadMoreThreshold: clamp(props.loadMoreThreshold ?? TREE_VIEW_DEFAULTS.loadMoreThreshold, loadMoreThresholdMin, loadMoreThresholdMax),
  })
  const { scrollRef, scrollToIndex } = collection

  const treeRef = useCallback((node: HTMLDivElement | null) => {
    tree.current = node
    scrollRef(node)
  }, [scrollRef])

  // A mounted row is scrolled in by its own box; one that is not is reached by the window, and shown once it mounts.
  const reveal = useCallback((index: number) => {
    const row = tree.current?.querySelector(`[data-index="${String(index)}"]`)
    if (row) {
      pending.current = -1
      row.scrollIntoView({ block: 'nearest' })
    } else {
      pending.current = index
      scrollToIndex(index)
    }
  }, [scrollToIndex])

  // Each render: the used height of a row, the count the window has read, and a row waiting to be shown.
  useLayoutEffect(() => {
    const node = tree.current
    if (!node) return
    const row = node.querySelector('[role="treeitem"]')
    const height = row ? Number.parseFloat(getComputedStyle(row).height) : 0
    if (height > 0 && Math.abs(height - unit) > 0.01) setUnit(height)
    // A synthetic scroll makes useCollection read the tree with its new rows; on mount its listener comes a commit later.
    if (given.current && counted !== rows.length) {
      node.dispatchEvent(new Event('scroll'))
      setCounted(rows.length)
    }
    given.current = true
    if (pending.current >= 0) reveal(pending.current)
    // Every scroll renders, as useCollection reads it: a wheel can leave the highlighted row mounted but out of sight.
    setOutOfView(isScrolledOut(node.querySelector('[data-highlighted]'), node))
  })

  const direction = useDirection()
  const labels = useLabels()

  const highlight = (index: number) => {
    const row = rows[index]
    if (!row) return
    setActive(row.node.id)
    reveal(index)
  }

  const run = (action: TreeKeyAction) => {
    if (action.type === 'move') { highlight(action.to); return }
    const row = rows[action.index]
    if (!row) return
    setActive(row.node.id)
    if (action.type === 'select') {
      if (selected !== row.node.id) setSelected(row.node.id)
      if (action.toggle) setOpen(toggled(open, row.node.id, !row.open))
      return
    }
    setOpen(toggled(open, row.node.id, action.type === 'open'))
  }

  const onKeyDown = (event: TreeKeyEvent) => {
    props.onKeyDown?.(event)
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
    const index = findRow(rows, active)
    const now = Date.now()
    // A space inside a query is text, as Base UI's typeahead keeps it; only after the query lapses does it select.
    const typing = typed.current.text !== '' && now - typed.current.at <= TYPEAHEAD_MS
    if (event.key.length === 1 && (event.key !== ' ' || typing)) {
      const text = typing ? typed.current.text + event.key : event.key
      typed.current = { text, at: now }
      const found = typeahead(rows, index, text)
      if (found >= 0) highlight(found)
      event.preventDefault()
      return
    }
    const action = keyAction(rows, index, event.key, direction)
    if (!action) return
    event.preventDefault()
    run(action)
  }

  // A key or a script highlights the selected row when visible, else the first; a press, the row pressed or none, unscrolled.
  const onFocus = (event: TreeFocusEvent) => {
    props.onFocus?.(event)
    if (event.target !== event.currentTarget) return
    const press = pressed.current
    pressed.current = null
    if (press !== null) {
      setActive(rows[press]?.node.id ?? null)
      return
    }
    const chosen = findRow(rows, selected)
    highlight(chosen >= 0 ? chosen : 0)
  }

  const onBlur = (event: TreeFocusEvent) => {
    props.onBlur?.(event)
    pressed.current = null
    if (event.target === event.currentTarget) setActive(null)
  }

  const onPointerDown = (event: TreePointerEvent) => {
    props.onPointerDown?.(event)
    pressed.current = rowIndexOf(event.target)
  }

  // A mouse focuses before it lifts; a finger after, and then clicks. A finger that scrolls is cancelled, and never focuses.
  const onPointerUp = (event: TreePointerEvent) => {
    props.onPointerUp?.(event)
    if (event.pointerType === 'mouse') pressed.current = null
  }

  const onPointerCancel = (event: TreePointerEvent) => {
    props.onPointerCancel?.(event)
    pressed.current = null
  }

  // A press does what Enter does. A disabled row takes no pointer, and is refused here as well.
  const onClick = (event: TreeMouseEvent) => {
    props.onClick?.(event)
    const index = rowIndexOf(event.target)
    const row = rows[index]
    if (!row || row.node.disabled === true || event.defaultPrevented) return
    run({ type: 'select', index, toggle: row.branch })
  }

  const base = useId()
  const mounted = collection.rows.find((row) => row.key === active)
  const rowsCap = props.visibleRows === undefined ? undefined : clamp(props.visibleRows, visibleRowsMin, visibleRowsMax)

  return {
    treeRef,
    rows: collection.rows,
    idOf: (index: number) => `${base}-${String(index)}`,
    selected,
    active,
    outOfView,
    // Absent while the highlighted row is not mounted, never an id no element has.
    activeDescendant: mounted ? `${base}-${String(mounted.index)}` : undefined,
    tabIndex: rows.length > 0 ? 0 : undefined,
    busy: status === 'loading' || status === 'loading-more' ? true : undefined,
    note: {
      idle: null, loading: props.loadingFallback ?? labels.common.loading, 'loading-more': labels.state.loadingMore,
      empty: props.emptyFallback ?? labels.state.empty,
    }[status],
    style: {
      ...props.style,
      '--tc-list-pad-start': `${String(collection.paddingStart)}px`,
      '--tc-list-pad-end': `${String(collection.paddingEnd)}px`,
      // Left out, the --tc-list-rows knob applies: React writes no style for an undefined value.
      '--tc-list-rows': rowsCap,
    },
    onKeyDown, onFocus, onBlur, onPointerDown, onPointerUp, onPointerCancel, onClick,
  }
}
