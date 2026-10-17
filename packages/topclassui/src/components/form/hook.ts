'use client'

import { useActionState, useCallback, useEffect, useRef } from 'react'

import type { FormErrors } from '#shared/form-errors.js'
import type { FormActionHookProps, FormActionHookResult } from './types.js'

/** True when any field holds a message: an empty string or an empty list is no error. */
function hasErrors(errors: FormErrors | undefined): boolean {
  return Object.values(errors ?? {}).some((value) => (typeof value === 'string' ? [value] : value ?? []).some((message) => message !== ''))
}

/** Where the keyboard lands for an invalid control: itself, or, for a group that takes no focus (a radiogroup, a
 * slider's root), its first tab stop inside, which is the checked or first radio, or the thumb. */
function focusTargetOf(invalid: HTMLElement): HTMLElement | null {
  if (invalid.tabIndex >= 0) return invalid
  for (const inner of invalid.querySelectorAll('*')) if (inner instanceof HTMLElement && inner.tabIndex >= 0) return inner
  return null
}

/** Moves the focus to the first invalid control of the form that takes it, so a reader hears the control and its error. */
function focusFirstInvalid(form: HTMLFormElement): void {
  for (const invalid of form.querySelectorAll('[aria-invalid="true"]')) {
    const target = invalid instanceof HTMLElement ? focusTargetOf(invalid) : null
    target?.focus()
    if (target && target.ownerDocument.activeElement === target) return
  }
}

/** FormAction's one hook: React's action state, the form's ref, and the focus on the first invalid control after an answer with errors. */
export function useFormAction({ action, initialState, permalink, ref: forwarded }: FormActionHookProps): FormActionHookResult {
  const [state, formAction, pending] = useActionState(action, initialState, permalink)
  const form = useRef(null as HTMLFormElement | null)
  // The state the page was rendered with: no answer has come yet, so nothing moves the focus.
  const first = useRef(state)

  useEffect(() => {
    if (state === first.current || !hasErrors(state.errors) || !form.current) return
    focusFirstInvalid(form.current)
  }, [state])

  const ref = useCallback((node: HTMLFormElement | null) => {
    form.current = node
    if (typeof forwarded === 'function') return forwarded(node)
    if (forwarded) forwarded.current = node
    return undefined
  }, [forwarded])

  return { state, formAction, pending, ref }
}
