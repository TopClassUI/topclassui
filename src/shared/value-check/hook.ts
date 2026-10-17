'use client'

import { useEffect, useRef } from 'react'

import { useLabels, useNumberFormat } from '#shared/provider/context.js'
import { type Marked, type ValueFault, type ValueRules, faultOf, markFault, messageOf } from './lib.js'

/** The input whose value the form sends, the visible inputs that carry the mark, and the rules to hold it to. */
export interface ValueCheckOptions {
  field: () => HTMLInputElement | HTMLTextAreaElement | null | undefined
  /** The visible inputs, when the sent one is hidden; the first takes the message. The field itself by default. */
  marks?: (() => readonly HTMLElement[]) | undefined
  rules: ValueRules
}

/** R-8.3-1 layer 2: holds the sent value to its rules on every input, change, blur and click in its form, after a reset,
 * and on the submit, which it stops while a rule is broken: a value set by code fires no event, and the submit reads it. */
export function useValueCheck({ field, marks, rules }: ValueCheckOptions): void {
  const labels = useLabels().valueCheck
  const fmt = useNumberFormat()
  const latest = useRef({ field, marks, rules, labels, fmt })
  latest.current = { field, marks, rules, labels, fmt }

  // After every commit: new rules, a new form or an input that mounted late all land here.
  useEffect(() => {
    const input = latest.current.field()
    if (!input) return
    const shown = (): readonly Marked[] => latest.current.marks?.() ?? [input]
    const check = (): ValueFault | null => {
      const now = latest.current
      const fault = faultOf(input.value, now.rules)
      markFault(shown(), fault, fault ? messageOf(fault, now.rules, now.labels, now.fmt) : '')
      return fault
    }
    // Capture on the form runs before React's listener at the root, so a stopped submit never reaches a form action.
    const onSubmit = (event: Event) => {
      if (!check()) return
      event.preventDefault()
      event.stopPropagation()
      const first = shown()[0]
      first?.focus()
      first?.reportValidity?.()
    }
    let timer: number | undefined
    // A reset fires before the fields change: read them after it.
    const onReset = () => { timer = window.setTimeout(check, 0) }
    check()
    const form = input.form
    input.addEventListener('input', check)
    input.addEventListener('change', check)
    input.addEventListener('focusout', check)
    // The browser validates before submit fires, on the click a button or an Enter sends: read the value first.
    form?.addEventListener('click', check, true)
    form?.addEventListener('submit', onSubmit, true)
    form?.addEventListener('reset', onReset)
    return () => {
      input.removeEventListener('input', check)
      input.removeEventListener('change', check)
      input.removeEventListener('focusout', check)
      form?.removeEventListener('click', check, true)
      form?.removeEventListener('submit', onSubmit, true)
      form?.removeEventListener('reset', onReset)
      window.clearTimeout(timer)
    }
  })
}
