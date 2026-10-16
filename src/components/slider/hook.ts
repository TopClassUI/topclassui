'use client'

import { useDirection } from '@base-ui/react/direction-provider'
import { useCallback, useImperativeHandle, useMemo } from 'react'

import { clamp } from '#shared/clamp.js'
import { useLabels, useLocale, useNumberFormat } from '#shared/provider/context.js'
import { useFormValue } from '#shared/use-form-value.js'
import { SLIDER_BOUNDARIES } from './boundaries.js'
import type { SliderChangeDetails, SliderStateProps, SliderValue } from './types.js'

const { limitMin, limitMax, stepMin, stepsBetweenMin } = SLIDER_BOUNDARIES

/** Base UI's own value text of a range thumb is the English "20 start range": the thumb's name already says which end. */
const formattedOnly = (formatted: string) => formatted

/** The value of a slider, held here so a form reset brings it back to its latest default (unit-4.md, "A form reset"),
 * with its limits clamped, the name routed to the range inputs, and the provider's locale and digits. */
export function useSlider(props: SliderStateProps) {
  const { value, defaultValue, onValueChange, ref, format } = props
  // R-5.7-7: a stray 1e308 or a step of 0 never reaches Base UI.
  const step = clamp(props.step, stepMin, limitMax)
  const limits = {
    min: clamp(props.min, limitMin, limitMax),
    max: clamp(props.max, limitMin, limitMax),
    step,
    // Below a step, Page Up lands back on the value it left: the large step is never smaller than the step.
    largeStep: clamp(props.largeStep, step, limitMax),
    minStepsBetweenValues: clamp(props.minStepsBetweenValues, stepsBetweenMin, limitMax),
  }
  const state = useFormValue({ value, defaultValue: defaultValue ?? limits.min })
  useImperativeHandle(ref, () => state.rootRef.current as HTMLDivElement, [state.rootRef])

  const labels = useLabels().slider
  const providerLocale = useLocale()
  // Left to its defaults Base UI formats with the runtime's locale, and the server and the browser print different digits.
  const numbering = useNumberFormat().resolvedOptions().numberingSystem
  const resolved = useMemo(() => ({ ...format, numberingSystem: format?.numberingSystem ?? numbering }), [format, numbering])

  // The caller first, with Base UI's details, so details.cancel() still keeps the thumb where it was.
  const onChange = (next: SliderValue, details: SliderChangeDetails) => {
    onValueChange?.(next, details)
    if (!details.isCanceled) state.setValue(next)
  }

  // Base UI sends no aria-invalid to the range input, the element a screen reader lands on, so it is set here.
  const invalid = props.invalid
  const markInvalid = useCallback((input: HTMLInputElement | null) => {
    if (invalid) input?.setAttribute('aria-invalid', 'true')
    else input?.removeAttribute('aria-invalid')
  }, [invalid])

  const name = { 'aria-label': props['aria-label'], 'aria-labelledby': props['aria-labelledby'] }
  const describedBy = props['aria-describedby']
  const single = typeof state.value === 'number'
  // One thumb takes the slider's name; each thumb of a range its own, and the group the slider's.
  const thumbs = typeof state.value === 'number'
    ? [{ ...name, 'aria-describedby': describedBy, inputRef: markInvalid }]
    : state.value.map((_, index) => ({
      'aria-label': index === 0 ? labels.minimum : labels.maximum,
      'aria-describedby': describedBy,
      getAriaValueText: formattedOnly,
      inputRef: markInvalid,
    }))

  return {
    // Base UI's keys and pointer follow its provider while the thumb's inset follows the CSS direction: one dir for both.
    dir: useDirection(),
    value: state.value,
    onValueChange: onChange,
    rootRef: state.rootRef,
    limits,
    root: single ? {} : name,
    thumbs,
    locale: props.locale ?? providerLocale,
    format: resolved,
  }
}
