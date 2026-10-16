'use client'

import { useEffect, useId, useImperativeHandle, useRef, useState } from 'react'

import { clamp } from '#shared/clamp.js'
import { COLLECTION_BOUNDARIES } from '#shared/contracts/collection.js'
import { guardEscape } from '#shared/overlay.js'
import { useLabels } from '#shared/provider/context.js'
import { usePortalLocale } from '#shared/provider/use-portal-locale.js'
import { useFormValue } from '#shared/use-form-value.js'
import { readNameFromLabels } from './lib.js'
import type { SelectChangeDetails, SelectStateProps } from './types.js'

const { visibleRowsMin, visibleRowsMax } = COLLECTION_BOUNDARIES

/** The popup of one Select and no other, by the scope its root made: the Escape guard looks no further. */
function toPopupSelector(scope: string): string {
  return `[data-select="${scope}"]`
}

/** The value of a Select, held here so a form reset brings it back to its latest default (unit-4.md, "A form reset"),
 * the placeholder in the provider's language, the dir and the lang its portal cannot inherit, the row count, and the
 * name of the open list, which is the trigger's field name and never its value. */
export function useSelect(props: SelectStateProps) {
  const { value, defaultValue, onValueChange, inputRef, visibleRows, placeholder } = props
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
  const onOpen = guardEscape((next: boolean, details: SelectChangeDetails) => {
    if (next && !named) setSpoken(readNameFromLabels(trigger.current))
    props.onOpenChange?.(next, details)
  }, toPopupSelector(scope))

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
    rows: visibleRows === undefined ? undefined : clamp(visibleRows, visibleRowsMin, visibleRowsMax),
  }
}
