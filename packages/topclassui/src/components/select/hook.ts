'use client'

import { useEffect, useId, useImperativeHandle, useRef, useState } from 'react'

import { clamp } from '#shared/clamp.js'
import { useCollection } from '#shared/collection/use-collection.js'
import { COLLECTION_BOUNDARIES } from '#shared/contracts/collection.js'
import { guardEscape } from '#shared/overlay.js'
import { useCollectionDefaults, useLabels } from '#shared/provider/context.js'
import { usePortalLocale } from '#shared/provider/use-portal-locale.js'
import { useFormValue } from '#shared/use-form-value.js'
import { SELECT_DEFAULTS } from './constants.js'
import { keyOfOption, readNameFromLabels } from './lib.js'
import type { SelectChangeDetails, SelectStateProps } from './types.js'

const { visibleRowsMin, visibleRowsMax, loadMoreThresholdMin, loadMoreThresholdMax } = COLLECTION_BOUNDARIES

/** The popup of one Select and no other, by the scope its root made: the Escape guard looks no further. */
function toPopupSelector(scope: string): string {
  return `[data-select="${scope}"]`
}

/** The value of a Select, held here so a form reset brings it back to its latest default (unit-4.md, "A form reset"),
 * the placeholder in the provider's language, the dir and the lang its portal cannot inherit, the row count, and the
 * name of the open list, which is the trigger's field name and never its value. */
export function useSelect(props: SelectStateProps) {
  const { items, value, defaultValue, onValueChange, inputRef, visibleRows, placeholder } = props
  const state = useFormValue({ value, defaultValue: defaultValue ?? null })
  useImperativeHandle(inputRef, () => state.inputRef.current as HTMLInputElement, [state.inputRef])
  const trigger = useRef(null as HTMLButtonElement | null)
  useImperativeHandle(props.ref, () => trigger.current as HTMLButtonElement, [])
  const scope = useId()
  const labels = useLabels()
  const { dir, lang } = usePortalLocale()

  // A label element names the trigger, not the list the focus moves into: its text is copied onto the list at each open.
  const named = props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined
  const [spoken, setSpoken] = useState(undefined as string | undefined)
  useEffect(() => { if (!named) setSpoken(readNameFromLabels(trigger.current)) }, [named])
  const [opened, setOpened] = useState(props.defaultOpen ?? false)
  const onOpen = guardEscape((next: boolean, details: SelectChangeDetails) => {
    if (next && !named) setSpoken(readNameFromLabels(trigger.current))
    props.onOpenChange?.(next, details)
    if (!details.isCanceled) setOpened(next)
  }, toPopupSelector(scope))

  const rows = visibleRows === undefined ? undefined : clamp(visibleRows, visibleRowsMin, visibleRowsMax)
  // R-8.5-1 without windowing: Base UI moves real focus over the mounted items (SelectRoot.js:292-306).
  const collection = useCollection({
    items,
    getKey: keyOfOption,
    virtualize: false,
    visibleRows: rows,
    hasMore: (props.hasMore ?? false) && (props.open ?? opened),
    loadMore: props.loadMore,
    loadMoreThreshold: clamp(props.loadMoreThreshold ?? SELECT_DEFAULTS.loadMoreThreshold, loadMoreThresholdMin, loadMoreThresholdMax),
  })
  const { virtualizeAbove } = useCollectionDefaults()
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && items.length > virtualizeAbove) {
      console.warn(`Select: ${String(items.length)} options are all mounted; a list this long belongs in a Combobox, which windows it.`)
    }
  }, [items.length, virtualizeAbove])

  // The caller first, with Base UI's details, so details.cancel() still keeps the value as it was.
  const onChange = (next: string | null, details: SelectChangeDetails) => {
    onValueChange?.(next, details)
    if (!details.isCanceled) state.setValue(next)
  }

  return {
    value: state.value,
    onValueChange: onChange,
    onOpenChange: onOpen,
    inputRef: state.inputRef,
    triggerRef: trigger,
    listLabel: props['aria-label'] ?? spoken,
    listLabelledBy: props['aria-labelledby'],
    scope,
    placeholder: placeholder ?? labels.select.placeholder,
    dir,
    lang,
    // Passed, it is set inline on the list; left out, React writes no style and the --tc-list-rows knob applies.
    rows,
    options: collection.rows,
    listRef: collection.scrollRef,
  }
}
