'use client'

import { useId, useImperativeHandle } from 'react'

import { clamp } from '#shared/clamp.js'
import { COLLECTION_BOUNDARIES } from '#shared/contracts/collection.js'
import { guardEscape } from '#shared/overlay.js'
import { useLabels } from '#shared/provider/context.js'
import { usePortalLocale } from '#shared/provider/use-portal-locale.js'
import { useFormValue } from '#shared/use-form-value.js'
import type { SelectChangeDetails, SelectStateProps } from './types.js'

const { visibleRowsMin, visibleRowsMax } = COLLECTION_BOUNDARIES

/** The popup of one Select and no other, by the scope its root made: the Escape guard looks no further. */
function toPopupSelector(scope: string): string {
  return `[data-select="${scope}"]`
}

/** The value of a Select, held here so a form reset brings it back to its latest default (unit-4.md, "A form reset"),
 * the placeholder in the provider's language, the dir and the lang its portal cannot inherit, and the row count. */
export function useSelect({ value, defaultValue, onValueChange, onOpenChange, inputRef, visibleRows, placeholder }: SelectStateProps) {
  const state = useFormValue({ value, defaultValue: defaultValue ?? null })
  useImperativeHandle(inputRef, () => state.inputRef.current as HTMLInputElement, [state.inputRef])
  const scope = useId()
  const labels = useLabels()
  const { dir, lang } = usePortalLocale()

  // The caller first, with Base UI's details, so details.cancel() still keeps the value as it was.
  const onChange = (next: string | null, details: SelectChangeDetails) => {
    onValueChange?.(next, details)
    if (!details.isCanceled) state.setValue(next)
  }

  return {
    value: state.value,
    onValueChange: onChange,
    onOpenChange: guardEscape(onOpenChange, toPopupSelector(scope)),
    inputRef: state.inputRef,
    scope,
    placeholder: placeholder ?? labels.select.placeholder,
    dir,
    lang,
    // Passed, it is set inline on the list; left out, React writes no style and the --tc-list-rows knob applies.
    rows: visibleRows === undefined ? undefined : clamp(visibleRows, visibleRowsMin, visibleRowsMax),
  }
}
