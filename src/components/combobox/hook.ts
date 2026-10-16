'use client'

import { Combobox as Base } from '@base-ui/react/combobox'
import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { clamp } from '#shared/clamp.js'
import { useCollection } from '#shared/collection/use-collection.js'
import { resolveMaxLength } from '#shared/contracts/boundaries.js'
import { COLLECTION_BOUNDARIES } from '#shared/contracts/collection.js'
import type { ListOption } from '#shared/contracts/option.js'
import { useLabels } from '#shared/provider/context.js'
import { usePortalLocale } from '#shared/provider/use-portal-locale.js'
import { useFormValue } from '#shared/use-form-value.js'
import { COMBOBOX_DEFAULTS, COMBOBOX_ROW_ESTIMATE } from './constants.js'
import { isAppended, keyOfOption, labelOfUnknown, nameFromLabels, optionAccessors, revealTop } from './lib.js'
import type { ComboboxChangeDetails, ComboboxHighlightDetails, ComboboxListProps, ComboboxValueProps } from './types.js'

const { visibleRowsMin, visibleRowsMax, loadMoreThresholdMin, loadMoreThresholdMax } = COLLECTION_BOUNDARIES

/** The value, held here so a form reset brings back the latest default (unit-4.md, "A form reset"), the options as
 * Base UI's collection, and the scroller the list fills so the root can bring a highlighted row into view. */
export function useCombobox(props: ComboboxValueProps) {
  const { items, value, defaultValue, onValueChange, onItemHighlighted, inputRef, maxLength, visibleRows, status } = props
  const state = useFormValue({ value, defaultValue: defaultValue ?? null })
  useImperativeHandle(inputRef, () => state.inputRef.current as HTMLInputElement, [state.inputRef])
  const input = useRef(null as HTMLInputElement | null)
  useImperativeHandle(props.ref, () => input.current as HTMLInputElement, [])
  const collection = useMemo(() => Base.createItems(items, optionAccessors), [items])
  const scroller = useRef(null as ((index: number) => void) | null)
  const labels = useLabels()

  const [opened, setOpened] = useState(props.defaultOpen ?? false)
  const open = props.open ?? opened
  const onOpen = (next: boolean, details: ComboboxChangeDetails) => {
    props.onOpenChange?.(next, details)
    if (!details.isCanceled) setOpened(next)
  }

  // Open, Base UI aria-hides a label pointing at the input, and Chrome names it with nothing: the text is copied then only.
  const named = props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined
  const [spoken, setSpoken] = useState(undefined as string | undefined)
  useEffect(() => { setSpoken(open && !named ? nameFromLabels(input.current) : undefined) }, [open, named])

  // The caller first, with Base UI's details, so details.cancel() still keeps the value as it was.
  const onChange = (next: string | null, details: ComboboxChangeDetails) => {
    onValueChange?.(next, details)
    if (!details.isCanceled) state.setValue(next)
  }

  // Base UI moves the highlight over every match, mounted or not; the list brings it in. A pointer is already on it.
  const onHighlight = (next: string | undefined, details: ComboboxHighlightDetails) => {
    onItemHighlighted?.(next, details)
    if (details.reason === 'keyboard' && details.index >= 0) scroller.current?.(details.index)
  }

  return {
    ...usePortalLocale(),
    value: state.value,
    onValueChange: onChange,
    onItemHighlighted: onHighlight,
    onOpenChange: onOpen,
    open,
    loaded: items.length,
    inputRef: state.inputRef,
    ref: input,
    label: props['aria-label'] ?? spoken,
    items: collection,
    labelOfUnknown,
    scroller,
    maxLength: resolveMaxLength(maxLength, 'search'),
    // Left out, the --tc-list-rows knob applies: React writes no style for an undefined value.
    rows: visibleRows === undefined ? undefined : clamp(visibleRows, visibleRowsMin, visibleRowsMax),
    loadMoreThreshold: clamp(
      props.loadMoreThreshold ?? COMBOBOX_DEFAULTS.loadMoreThreshold, loadMoreThresholdMin, loadMoreThresholdMax,
    ),
    busy: status === 'loading' || status === 'loading-more',
    spinning: status === 'loading',
    // While the first page loads, an empty list is not "No results": the status line says Loading instead.
    empty: status === 'loading' ? null : (props.emptyFallback ?? labels.collection.noResults),
    note: status === 'loading-more'
      ? labels.state.loadingMore
      : status === 'loading' && items.length === 0 ? labels.common.loading : null,
  }
}

/** The list, windowed by the shared hook (R-8.5-1): the matches Base UI filtered, the rows to mount, the spacers that
 * stand for the rest, and the scroller the root calls with the index of a highlighted row. */
export function useComboboxList({
  scroller, virtualize, hasMore, open, loaded, loadMore, loadMoreThreshold, rows, selected,
}: ComboboxListProps) {
  const filtered: readonly ListOption[] = Base.useFilteredItems()
  const [unit, setUnit] = useState(COMBOBOX_ROW_ESTIMATE)
  const collection = useCollection({
    items: filtered,
    getKey: keyOfOption,
    virtualize,
    hasMore: hasMore && open,
    loadMore,
    loadedCount: loaded,
    loadMoreThreshold,
    estimateRowHeight: unit,
  })
  const { scrollRef, scrollToIndex } = collection
  const list = useRef(null as HTMLDivElement | null)
  const pending = useRef(-1)
  const shown = useRef(null as readonly ListOption[] | null)

  const listRef = useCallback((node: HTMLDivElement | null) => {
    list.current = node
    scrollRef(node)
  }, [scrollRef])

  // A mounted row is scrolled whole by its own box; one that is not is reached by the window, and then shown whole.
  const reveal = useCallback((index: number) => {
    const node = list.current
    if (!node) return
    const row = node.querySelector(`[data-row="${String(index)}"]`)
    if (!(row instanceof HTMLElement)) {
      pending.current = index
      scrollToIndex(index)
      return
    }
    pending.current = -1
    const inset = Number.parseFloat(getComputedStyle(node).paddingTop) || 0
    node.scrollTop = revealTop(row.offsetTop, row.offsetHeight, node.scrollTop, node.clientHeight, inset)
  }, [scrollToIndex])

  // Each render: the used height of a row, which the opening scale does not shrink; a new query at the top; a pending row.
  useLayoutEffect(() => {
    const node = list.current
    const row = node?.querySelector('[role="option"]')
    const height = row ? Number.parseFloat(getComputedStyle(row).height) : 0
    if (height > 0 && Math.abs(height - unit) > 0.01) setUnit(height)
    if (node && shown.current !== filtered) {
      const before = shown.current
      shown.current = filtered
      const chosen = before === null && selected !== null ? filtered.findIndex((option) => option.value === selected) : -1
      if (chosen >= 0) scrollToIndex(chosen, 'center')
      else if (before !== null && !isAppended(before, filtered)) node.scrollTop = 0
    }
    if (pending.current >= 0) reveal(pending.current)
  })

  useEffect(() => {
    scroller.current = reveal
    return () => { scroller.current = null }
  }, [scroller, reveal])

  return {
    listRef,
    rows: collection.rows,
    total: filtered.length,
    style: {
      '--tc-list-pad-start': `${String(collection.paddingStart)}px`,
      '--tc-list-pad-end': `${String(collection.paddingEnd)}px`,
      '--tc-list-rows': rows,
    },
  }
}
