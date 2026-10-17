'use client'

import { useImperativeHandle } from 'react'

import { useLabels, useNumberFormat } from '#shared/provider/context.js'
import { useFormValue } from '#shared/use-form-value.js'
import { useValueCheck } from '#shared/value-check/hook.js'
import { OTP_FIELD_DEFAULTS } from './constants.js'
import { cellsOf, checkRules, clampLength, digitRules, layoutCells, sentInput } from './lib.js'
import type { OtpFieldChangeDetails, OtpFieldCompleteDetails, OtpFieldValueProps } from './types.js'

/** The code, held here so a form reset brings it back to its latest default (unit-4.md, "A form reset"), the clamped
 * length, the name of each cell after the first, and the separators. Base UI always gets the controlled pair. */
export function useOtpField({
  length: given,
  groupSize,
  value,
  defaultValue = OTP_FIELD_DEFAULTS.defaultValue,
  onValueChange,
  onValueComplete,
  autoSubmit,
  validationType,
  normalizeValue,
  inputMode,
  ref,
}: OtpFieldValueProps) {
  // The hidden text input needs no sync: after a reset it holds what the state holds.
  const state = useFormValue({ value, defaultValue })
  useImperativeHandle(ref, () => state.rootRef.current as HTMLDivElement, [state.rootRef])
  const labels = useLabels()
  const fmt = useNumberFormat()

  const length = clampLength(given)
  // A code written into the sent input by script still answers to the cells and the kind of character.
  useValueCheck({
    field: () => sentInput(state.rootRef.current),
    marks: () => cellsOf(state.rootRef.current),
    rules: checkRules(length, validationType),
  })
  const { separators, whole } = layoutCells(length, groupSize)
  const cells = separators.map((separator, index) => ({
    separator,
    label: index === 0 ? undefined : labels.otp.character(index + 1, length, fmt),
  }))

  // The caller first, with Base UI's details, so details.cancel() still keeps the code as it was.
  const onChange = (next: string, details: OtpFieldChangeDetails) => {
    onValueChange?.(next, details)
    if (!details.isCanceled) state.setValue(next)
  }

  // Not Base UI's autoSubmit: outside a Field it finds the form of whichever control mounted last.
  const onComplete = (code: string, details: OtpFieldCompleteDetails) => {
    onValueComplete?.(code, details)
    if (autoSubmit) state.rootRef.current?.querySelector('input')?.form?.requestSubmit()
  }

  return {
    value: state.value,
    onValueChange: onChange,
    onValueComplete: onComplete,
    rootRef: state.rootRef,
    length,
    cells,
    whole,
    digits: digitRules({ validationType, normalizeValue, inputMode }),
  }
}
