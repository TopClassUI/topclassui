'use client'

import { useImperativeHandle } from 'react'

import { useFormValue } from '#shared/use-form-value.js'
import { SWITCH_DEFAULTS } from './constants.js'
import type { SwitchChangeDetails, SwitchValueProps } from './types.js'

/** A reset puts the hidden checkbox back to its first default, and React writes `checked` only when its state changes. */
function syncChecked(value: boolean, input: HTMLInputElement | null): void {
  if (input) input.checked = value
}

/** The value of a switch, held here so a form reset brings it back to its latest default (unit-4.md, "A form
 * reset"). Base UI always gets the controlled pair and never a default; a caller's inputRef follows ours. */
export function useSwitch({
  checked,
  defaultChecked = SWITCH_DEFAULTS.defaultChecked,
  onCheckedChange,
  inputRef,
}: SwitchValueProps) {
  const state = useFormValue({ value: checked, defaultValue: defaultChecked, sync: syncChecked })
  useImperativeHandle(inputRef, () => state.inputRef.current as HTMLInputElement, [state.inputRef])

  // The caller first, with Base UI's details, so details.cancel() still keeps the switch as it was.
  const onChange = (next: boolean, details: SwitchChangeDetails) => {
    onCheckedChange?.(next, details)
    if (!details.isCanceled) state.setValue(next)
  }

  return { checked: state.value, onCheckedChange: onChange, inputRef: state.inputRef }
}
