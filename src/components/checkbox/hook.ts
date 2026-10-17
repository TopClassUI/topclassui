'use client'

import { useImperativeHandle } from 'react'

import { useFormValue } from '#shared/use-form-value.js'
import { CHECKBOX_DEFAULTS } from './constants.js'
import type { CheckboxChangeDetails, CheckboxValueProps } from './types.js'

/** A reset puts the hidden checkbox back to its first default, and React writes `checked` only when its state changes. */
function syncChecked(value: boolean, input: HTMLInputElement | null): void {
  if (input) input.checked = value
}

/** The value of a checkbox, held here so a form reset brings it back to its latest default (unit-4.md, "A form
 * reset"). Base UI always gets the controlled pair and never a default; a caller's inputRef follows ours. */
export function useCheckbox({
  checked,
  defaultChecked = CHECKBOX_DEFAULTS.defaultChecked,
  onCheckedChange,
  inputRef,
}: CheckboxValueProps) {
  const state = useFormValue({ value: checked, defaultValue: defaultChecked, sync: syncChecked })
  useImperativeHandle(inputRef, () => state.inputRef.current as HTMLInputElement, [state.inputRef])

  // The caller first, with Base UI's details, so details.cancel() still keeps the box as it was.
  const onChange = (next: boolean, details: CheckboxChangeDetails) => {
    onCheckedChange?.(next, details)
    if (!details.isCanceled) state.setValue(next)
  }

  return { checked: state.value, onCheckedChange: onChange, inputRef: state.inputRef }
}
