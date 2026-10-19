'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { clamp } from '#shared/clamp.js'
import { useCollection } from '#shared/collection/use-collection.js'
import { COLLECTION_BOUNDARIES } from '#shared/contracts/collection.js'
import { useCollectionDefaults, useLabels } from '#shared/provider/context.js'
import { usePortalLocale } from '#shared/provider/use-portal-locale.js'
import { useControllableState } from '#shared/use-controllable-state.js'
import { COMMAND_BOUNDARIES } from './boundaries.js'
import { COMMAND_DEFAULTS } from './constants.js'
import { arrangeCommands, filterCommands, keyOfEntry, matchesShortcut, runsOf, withActiveRow } from './lib.js'
import type { CommandHighlight, CommandPanelProps, CommandShellOptions } from './types.js'

/** The shell: the open state, whether the panel has ever been asked for, and the shortcut on the
 * document. The panel mounts on the first open and stays, so its module loads once and only then. */
export function useCommand({
  open,
  defaultOpen = COMMAND_DEFAULTS.defaultOpen,
  onOpenChange,
  shortcut = COMMAND_DEFAULTS.shortcut,
}: CommandShellOptions) {
  const [isOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange })
  const [mounted, setMounted] = useState(isOpen)
  if (isOpen && !mounted) setMounted(true)

  useEffect(() => {
    if (shortcut === null) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !matchesShortcut(event, shortcut)) return
      // The browser's own Ctrl+K moves to its search bar.
      event.preventDefault()
      if (!isOpen) setOpen(true)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown) }
  }, [shortcut, isOpen, setOpen])

  return { open: isOpen, setOpen, mounted }
}

/** The panel: the query and what it leaves, in the rows windowing mounts, with the active row kept
 * in view. Base UI moves the highlight over every match, mounted or not; this scrolls it in. */
export function useCommandPanel(props: CommandPanelProps) {
  const { items, getKey, getLabel, getGroup, onSelect, onOpenChange, onQueryChange, virtualize, visibleRows, status } = props
  const [query, setQuery] = useState('')
  // Base UI animates no dialog that mounts open: the panel mounts closed and opens a commit later, so it fades in.
  const [primed, setPrimed] = useState(false)
  useEffect(() => { setPrimed(true) }, [])
  const list = useRef(null as HTMLDivElement | null)
  const reveal = useRef(-1)
  const [unit, setUnit] = useState(useCollectionDefaults().estimateRowHeight)
  // Base UI's index of the highlighted item, by any means, so its row stays mounted when a scroll moves the window.
  const [active, setActive] = useState(-1)

  const filtered = useMemo(() => filterCommands(items, query, getLabel), [items, query, getLabel])
  const arranged = useMemo(() => arrangeCommands(filtered, getKey, getGroup), [filtered, getKey, getGroup])
  const rows = visibleRows === undefined
    ? undefined
    : clamp(visibleRows, COMMAND_BOUNDARIES.visibleRowsMin, COMMAND_BOUNDARIES.visibleRowsMax)
  const loadMoreThreshold = clamp(props.loadMoreThreshold ?? COMMAND_DEFAULTS.loadMoreThreshold,
    COLLECTION_BOUNDARIES.loadMoreThresholdMin, COLLECTION_BOUNDARIES.loadMoreThresholdMax)
  // The entries hold the headings and only the matches: one page is asked per count of items loaded.
  const collection = useCollection({
    items: arranged.entries,
    getKey: keyOfEntry,
    virtualize,
    estimateRowHeight: unit,
    visibleRows: rows,
    hasMore: (props.hasMore ?? false) && props.open,
    loadMore: props.loadMore,
    loadMoreThreshold,
    loadedCount: items.length,
  })
  const { scrollRef, scrollToIndex } = collection

  const ref = useCallback((node: HTMLDivElement | null) => {
    list.current = node
    scrollRef(node)
  }, [scrollRef])

  // Each render: the size of a unit (zoom and a coarse pointer change it), and the row to bring into view.
  useLayoutEffect(() => {
    const node = list.current
    const row = node?.querySelector('[data-command-row]')
    // The used height, which the popup's opening scale does not shrink as the box it draws does.
    const height = row ? Number.parseFloat(getComputedStyle(row).height) : 0
    if (height > 0 && Math.abs(height - unit) > 0.01) setUnit(height)
    if (reveal.current < 0 || !node) return
    const target = node.querySelector(`[data-command-row="${String(reveal.current)}"]`)
    if (target) {
      reveal.current = -1
      target.scrollIntoView({ block: 'nearest' })
    } else scrollToIndex(reveal.current)
  })

  const onItemHighlighted = useCallback((_value: unknown, details: CommandHighlight) => {
    setActive(details.index)
    // A pointer highlights what it is over; a query highlights the first row, which a new query scrolls to.
    if (details.reason !== 'keyboard') return
    const row = arranged.rowOfItem[details.index]
    if (row === undefined || !list.current) return
    reveal.current = row
    const target = list.current.querySelector(`[data-command-row="${String(row)}"]`)
    if (target) {
      reveal.current = -1
      target.scrollIntoView({ block: 'nearest' })
    } else scrollToIndex(row)
  }, [arranged, scrollToIndex])

  const onValueChange = useCallback((next: string) => {
    setQuery(next)
    onQueryChange?.(next)
    if (list.current) list.current.scrollTop = 0
  }, [onQueryChange])

  const select = useCallback((item: unknown) => {
    onOpenChange(false)
    onSelect(item)
  }, [onOpenChange, onSelect])

  const windowed = collection.rows.map((row) => row.item)
  const mounted = collection.virtualized ? withActiveRow(windowed, arranged.entries, arranged.rowOfItem[active] ?? -1) : windowed
  const labels = useLabels()

  return {
    ...usePortalLocale(),
    open: props.open && primed,
    query,
    onValueChange,
    onItemHighlighted,
    // The next open starts from an empty query, once this one has finished closing.
    onOpenChangeComplete: (next: boolean) => { if (!next) setQuery('') },
    onDialogOpenChange: (next: boolean) => { onOpenChange(next) },
    select,
    base: arranged.base,
    virtualized: collection.virtualized,
    runs: runsOf(mounted),
    total: arranged.entries.length,
    listRef: ref,
    // Left out, the --tc-list-rows knob applies: React writes no style for an undefined value.
    rows,
    busy: status === 'loading' || status === 'loading-more',
    labels: {
      title: labels.command.label,
      placeholder: labels.command.placeholder,
      escape: labels.command.escape,
      empty: labels.collection.noResults,
      loading: labels.common.loading,
    },
  }
}
