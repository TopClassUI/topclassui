'use client'

import { createContext, useContext, useImperativeHandle, useMemo, useState } from 'react'

import { useFormValue } from '#shared/use-form-value.js'
import { useServerTabStop } from '#shared/use-server-tab-stop.js'
import { SEGMENTED_CONTROL_DEFAULTS } from './constants.js'
import type { SegmentedControlChangeDetails, SegmentedControlLook, SegmentedControlValueProps } from './types.js'

const fallback: SegmentedControlLook = { size: SEGMENTED_CONTROL_DEFAULTS.size, opensOn: null }

/** The look of the nearest SegmentedControlRoot. Base UI tells its radios nothing of ours. */
export const SegmentedControlLookContext = createContext(fallback)

/** A reset puts each radio input back to its first default, and React writes `checked` only when its state changes. */
function syncRadios(value: string | null, _input: HTMLInputElement | null, root: HTMLDivElement | null): void {
  for (const input of root?.querySelectorAll('input') ?? []) {
    if (input.type === 'radio') input.checked = input.value === value
  }
}

/** The value of a segmented control, held here so a form reset brings it back to its latest default (unit-4.md, "A
 * form reset"), and the look its segments read. Base UI always gets the controlled pair. */
export function useSegmentedControlRoot(size: SegmentedControlLook['size'], { value, defaultValue, onValueChange, ref }: SegmentedControlValueProps) {
  const state = useFormValue({ value, defaultValue: defaultValue ?? null, sync: syncRadios })
  useImperativeHandle(ref, () => state.rootRef.current as HTMLDivElement, [state.rootRef])

  // Read once: the server HTML and the render that hydrates must agree on the one tab stop.
  const [opensOn] = useState(() => value ?? defaultValue ?? null)
  const look = useMemo(() => ({ size, opensOn }), [size, opensOn])

  // The caller first, with Base UI's details, so details.cancel() still keeps the track as it was.
  const onChange = (next: string | null, details: SegmentedControlChangeDetails) => {
    // Base UI calls this with the value of a radio only; null is our own word for none selected.
    if (next === null) return
    onValueChange?.(next, details)
    if (!details.isCanceled) state.setValue(next)
  }

  return { value: state.value, onValueChange: onChange, rootRef: state.rootRef, look }
}

/** What a segment reads: the size of its track, and a tab stop for the server HTML alone on the segment the page
 * opens on, since Base UI serves every radio with tabindex -1 until it hydrates. */
export function useSegmentedControlItem(value: string) {
  const { size, opensOn } = useContext(SegmentedControlLookContext)
  const stop = useServerTabStop(value === opensOn)
  return { size, stop }
}
