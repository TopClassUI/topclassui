'use client'

import { useEffect, useImperativeHandle, useRef } from 'react'
import { flushSync } from 'react-dom'

import { useLabels, useLocale, useNumberFormat } from '#shared/provider/context.js'
import { useFormValue } from '#shared/use-form-value.js'
import { NUMBER_FIELD_DEFAULTS } from './constants.js'
import { clampValue, formatValue, latinPaste, numberingSystemOf, resolveLimits } from './lib.js'
import type { NumberFieldChangeDetails, NumberFieldPasteEvent, NumberFieldValueProps } from './types.js'

/** Writes the text of the input through the native setter, so React and Base UI read it as typing. */
function writeText(input: HTMLInputElement, text: string): void {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, text)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

/** The value of a number field, clamped and held here so a form reset brings it back to its latest default
 * (unit-4.md, "A form reset"); the bounds, the locale and the digits Base UI formats with; and the three labels. */
export function useNumberField({
  value,
  defaultValue,
  onValueChange,
  inputRef,
  min,
  max,
  step = NUMBER_FIELD_DEFAULTS.step,
  allowOutOfRange,
  locale,
  format,
}: NumberFieldValueProps) {
  const labels = useLabels().numberField
  const providerLocale = useLocale()
  const providerSystem = useNumberFormat().resolvedOptions().numberingSystem
  const resolvedLocale = locale ?? providerLocale
  const numberFormat = { ...format, numberingSystem: numberingSystemOf(locale, format, providerSystem) }
  const limits = resolveLimits(min, max, step)

  const field = useRef(null as HTMLInputElement | null)
  const quiet = useRef(false)
  // A reset while the input is focused: Base UI keeps typed text until a blur, which would then send it.
  const syncText = (next: number | null) => {
    const input = field.current
    const text = formatValue(next, resolvedLocale, numberFormat)
    if (!input || input.ownerDocument.activeElement !== input || input.value === text) return
    quiet.current = true
    try { writeText(input, text) } finally { quiet.current = false }
  }

  const state = useFormValue({
    value: clampValue(value, limits, allowOutOfRange),
    defaultValue: clampValue(defaultValue, limits, allowOutOfRange) ?? null,
    sync: syncText,
  })
  useImperativeHandle(inputRef, () => state.inputRef.current as HTMLInputElement, [state.inputRef])

  // Typed before hydration, the text stays while Base UI and the hidden input keep the default: put the default back.
  useEffect(() => {
    const input = field.current
    if (input && input.value !== input.defaultValue) input.value = input.defaultValue
  }, [])

  // A typed "1,234" as latinPaste reads it, on leaving or on the Enter that submits: both run before React's at the root.
  useEffect(() => {
    const input = field.current
    if (!input) return
    const leave = () => {
      if (input.readOnly || input.disabled) return
      const plain = latinPaste(input.value, resolvedLocale, numberFormat)
      if (plain !== null) flushSync(() => { writeText(input, plain) })
    }
    const enter = (event: KeyboardEvent) => { if (event.key === 'Enter') leave() }
    input.addEventListener('focusout', leave)
    input.addEventListener('keydown', enter)
    return () => {
      input.removeEventListener('focusout', leave)
      input.removeEventListener('keydown', enter)
    }
  })

  // The caller first, with Base UI's details, so details.cancel() still keeps the field as it was. A reset calls no one.
  const onChange = (next: number | null, details: NumberFieldChangeDetails) => {
    if (!quiet.current) onValueChange?.(next, details)
    if (!details.isCanceled) state.setValue(next)
  }

  // Runs before Base UI's own paste, which a prevented event skips.
  const onPaste = (event: NumberFieldPasteEvent) => {
    const input = event.currentTarget
    if (input.readOnly || input.disabled) return
    const plain = latinPaste(event.clipboardData.getData('text/plain'), resolvedLocale, numberFormat)
    if (plain === null) return
    event.preventDefault()
    const { selectionStart, selectionEnd, value: text } = input
    writeText(input, text.slice(0, selectionStart ?? text.length) + plain + text.slice(selectionEnd ?? text.length))
  }

  return {
    value: state.value,
    onValueChange: onChange,
    inputRef: state.inputRef,
    fieldRef: field,
    onPaste,
    ...limits,
    locale: resolvedLocale,
    format: numberFormat,
    labels,
  }
}
