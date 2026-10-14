'use client'

import { useLayoutEffect, useRef, useState } from 'react'

import { useLabels, useNumberFormat } from '#shared/provider/context.js'
import { countText, isCounted, limitOf, rowsFor } from './lib.js'
import type { TextareaFieldValueProps } from './types.js'

/** Sets rows back to the caller's, reads what the text needs, and sets that, up to maxRows. */
function fit(field: HTMLTextAreaElement, rows: number, maxRows: number): void {
  field.rows = rows
  const style = getComputedStyle(field)
  const padding = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom)
  // A line-height of normal reads as no number: take the browser's usual 1.2 of the font size.
  const line = Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.2
  field.rows = rowsFor(field.scrollHeight, padding, line, rows, maxRows)
}

/** The holder's one hook: it finds the textarea inside its div, writes its rows and counts its text. */
export function useTextareaField({ rows, maxRows, autosize, showCount, cap, length }: TextareaFieldValueProps) {
  const ref = useRef(null as HTMLDivElement | null)
  // The server's count first, so hydration prints what the server printed.
  const [count, setCount] = useState(length)
  const labels = useLabels()
  const format = useNumberFormat()

  const measure = () => {
    const field = ref.current?.querySelector('textarea')
    if (!field) return
    setCount(field.value.length)
    if (autosize) fit(field, rows, maxRows)
  }

  // After every commit: a controlled value, a new default or new rows all land here.
  useLayoutEffect(() => {
    measure()
    // A form reset sends no input event, and it fires before the fields change: read them after it.
    const form = ref.current?.querySelector('textarea')?.form
    let timer: number | undefined
    const onReset = () => { timer = window.setTimeout(measure, 0) }
    form?.addEventListener('reset', onReset)
    return () => {
      form?.removeEventListener('reset', onReset)
      window.clearTimeout(timer)
    }
  })

  return {
    ref,
    onInput: measure,
    counted: isCounted(count, cap, showCount),
    limit: limitOf(count, cap),
    visible: cap === null ? '' : countText(count, cap, format),
    spoken: cap === null ? '' : labels.textarea.count(count, cap, format),
  }
}
