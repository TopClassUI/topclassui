'use client'

import { createContext, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'

import { useProviderPresence } from '#shared/provider/context.js'
import { useFormValue } from '#shared/use-form-value.js'
import { serveTabStopOn, useServerTabStop } from '#shared/use-server-tab-stop.js'
import { SEGMENTED_CONTROL_DEFAULTS } from './constants.js'
import type { SegmentedControlChangeDetails, SegmentedControlLook, SegmentedControlValueProps } from './types.js'

const fallback: SegmentedControlLook = { size: SEGMENTED_CONTROL_DEFAULTS.size, opensOn: null }

/** The look of the nearest SegmentedControlRoot. Base UI tells its radios nothing of ours. */
const SegmentedControlLookContext = createContext(fallback)

/** A reset puts each radio input back to its first default, and React writes `checked` only when its state changes. */
function syncRadios(value: string | null, _input: HTMLInputElement | null, root: HTMLDivElement | null): void {
  for (const input of root?.querySelectorAll('input') ?? []) {
    if (input.type === 'radio') input.checked = input.value === value
  }
}

/** The value of a segmented control, held here so a form reset brings it back to its latest default (unit-4.md, "A
 * form reset"), and the look its segments read. Base UI always gets the controlled pair. */
export function useSegmentedControlRoot(size: SegmentedControlLook['size'], { value, defaultValue, onValueChange, ref, children, disabled }: SegmentedControlValueProps) {
  useProviderPresence()
  // Base UI puts its tab stop on the checked radio only on mount, so a value set from outside remounts it, focus allowing.
  const [resetKey, setResetKey] = useState(0)
  const picked = useRef(value)
  const remount = (root: HTMLDivElement | null) => {
    if (!root?.contains(document.activeElement)) setResetKey((key) => key + 1)
  }
  const sync = (next: string | null, input: HTMLInputElement | null, root: HTMLDivElement | null) => {
    syncRadios(next, input, root)
    remount(root)
  }
  const state = useFormValue({ value, defaultValue: defaultValue ?? null, sync })
  useImperativeHandle(ref, () => state.rootRef.current as HTMLDivElement, [state.rootRef, resetKey])

  // A controlled value its owner changed, not one the group picked.
  useEffect(() => {
    if (value === picked.current) return
    picked.current = value
    if (!state.rootRef.current?.contains(document.activeElement)) setResetKey((key) => key + 1)
  }, [value, state.rootRef])

  // Read once: the server HTML and the render that hydrates must agree on the one tab stop.
  const [opensOn] = useState(() => serveTabStopOn(children, value ?? defaultValue ?? null, disabled))
  const look = useMemo(() => ({ size, opensOn }), [size, opensOn])

  // The caller first, with Base UI's details, so details.cancel() still keeps the track as it was.
  const onChange = (next: string | null, details: SegmentedControlChangeDetails) => {
    // Base UI calls this with the value of a radio only; null is our own word for none selected.
    if (next === null) return
    onValueChange?.(next, details)
    if (details.isCanceled) return
    picked.current = next
    state.setValue(next)
  }

  return { value: state.value, onValueChange: onChange, rootRef: state.rootRef, look, resetKey, Context: SegmentedControlLookContext }
}

/** What a segment reads: the size of its track, and a tab stop for the server HTML alone on the segment the page
 * opens on, since Base UI serves every radio with tabindex -1 until it hydrates. */
export function useSegmentedControlItem(value: string) {
  const { size, opensOn } = useContext(SegmentedControlLookContext)
  const stop = useServerTabStop(value === opensOn)
  return { size, stop }
}
