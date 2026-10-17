'use client'

import { createContext, useContext, useImperativeHandle, useMemo, useState } from 'react'

import { useFormValue } from '#shared/use-form-value.js'
import { useServerTabStop } from '#shared/use-server-tab-stop.js'
import { RADIO_GROUP_DEFAULTS } from './constants.js'
import type { RadioGroupChangeDetails, RadioGroupLook, RadioGroupValueProps } from './types.js'

const fallback: RadioGroupLook = { size: RADIO_GROUP_DEFAULTS.size, opensOn: null }

/** The look of the nearest RadioGroupRoot. Base UI tells its radios nothing of ours. */
export const RadioGroupLookContext = createContext(fallback)

/** A reset puts each radio input back to its first default, and React writes `checked` only when its state changes. */
function syncRadios(value: string | null, _input: HTMLInputElement | null, root: HTMLDivElement | null): void {
  for (const input of root?.querySelectorAll('input') ?? []) {
    if (input.type === 'radio') input.checked = input.value === value
  }
}

/** The value of a radio group, held here so a form reset brings it back to its latest default (unit-4.md, "A form
 * reset"), and the look its radios read. Base UI always gets the controlled pair, with null for no radio checked. */
export function useRadioGroupRoot(size: RadioGroupLook['size'], { value, defaultValue, onValueChange, ref }: RadioGroupValueProps) {
  const state = useFormValue({ value, defaultValue: defaultValue ?? null, sync: syncRadios })
  useImperativeHandle(ref, () => state.rootRef.current as HTMLDivElement, [state.rootRef])

  // Read once: the server HTML and the render that hydrates must agree on the one tab stop.
  const [opensOn] = useState(() => value ?? defaultValue ?? null)
  const look = useMemo(() => ({ size, opensOn }), [size, opensOn])

  // The caller first, with Base UI's details, so details.cancel() still keeps the group as it was.
  const onChange = (next: string | null, details: RadioGroupChangeDetails) => {
    // Base UI calls this with the value of a radio only; null is our own word for none checked.
    if (next === null) return
    onValueChange?.(next, details)
    if (!details.isCanceled) state.setValue(next)
  }

  return { value: state.value, onValueChange: onChange, rootRef: state.rootRef, look }
}

/** What a radio reads: the size of its group, and a tab stop for the server HTML alone on the radio the page opens
 * on, since Base UI serves every radio with tabindex -1 until it hydrates. */
export function useRadioGroupItem(value: string) {
  const { size, opensOn } = useContext(RadioGroupLookContext)
  const stop = useServerTabStop(value === opensOn)
  return { size, stop }
}
