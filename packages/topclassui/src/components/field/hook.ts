'use client'

import { useEffect, useId, useRef, useState } from 'react'

import { type FormErrors, useFormErrors } from '#shared/form-errors.js'
import { FIELD_CHANGE_EVENT } from './constants.js'
import { entriesOf, formOf, messagesOf, sameEntries, toFieldIds } from './lib.js'
import type {
  FieldChangeEvent, FieldClickEvent, FieldInputEvent, FieldKeyEvent, FieldLiveHookProps, FieldLiveHookResult,
} from './types.js'

/** FieldLive's one hook: the ids as Field makes them, and the error of the prop, else of the nearest FormAction.
 * A form's error goes once the field's value changes, and comes back with the action's next answer. */
export function useFieldLive({ id, name, error, ref, onInput, onChange, onClick, onKeyUp }: FieldLiveHookProps): FieldLiveHookResult {
  const generated = useId()
  const errors = useFormErrors()
  // The errors object whose message for this field the user has since answered by changing the value.
  const [answered, setAnswered] = useState(undefined as FormErrors | undefined)
  const rootRef = useRef(null as HTMLDivElement | null)
  const recorded = useRef(null as string[] | null)
  const frame = useRef(0)
  const own = error !== undefined
  const fromForm = own || answered === errors ? undefined : errors?.[name]
  const waiting = messagesOf(fromForm).length > 0

  /** True, and the error gone, when the entries differ from those recorded; a click that changes nothing keeps it. */
  const answer = () => {
    const before = recorded.current
    if (before === null || sameEntries(before, entriesOf(rootRef.current, name))) return false
    setAnswered(errors)
    return true
  }

  useEffect(() => {
    recorded.current = null
    if (!waiting) return undefined
    // A task of its own, so React's form reset and useFormValue's restore, each queued first, have landed.
    const timer = setTimeout(() => { recorded.current = entriesOf(rootRef.current, name) }, 0)
    // Several Fields may share a name in one form (choice 33): the one that caught the change tells the others.
    const form = rootRef.current ? formOf(rootRef.current) : null
    const recheck = () => { answer() }
    form?.addEventListener(FIELD_CHANGE_EVENT, recheck)
    return () => {
      clearTimeout(timer)
      form?.removeEventListener(FIELD_CHANGE_EVENT, recheck)
    }
  }, [errors, name, waiting])

  useEffect(() => () => { cancelAnimationFrame(frame.current) }, [])

  /** On the next frame, so a Select that writes its hidden input from state has written it. */
  const check = () => {
    if (!waiting) return
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const root = rootRef.current
      if (answer() && root) formOf(root)?.dispatchEvent(new Event(FIELD_CHANGE_EVENT))
    })
  }

  const setRoot = (node: HTMLDivElement | null) => {
    rootRef.current = node
    if (typeof ref === 'function') return ref(node)
    if (ref) ref.current = node
    return undefined
  }

  // React events, so a press in a portaled popup, which bubbles through the React tree, reaches the root too.
  return {
    ids: toFieldIds(id ?? generated),
    error: own ? error : fromForm,
    root: {
      ref: setRoot,
      onInput: (event: FieldInputEvent) => { onInput?.(event); check() },
      onChange: (event: FieldChangeEvent) => { onChange?.(event); check() },
      onClick: (event: FieldClickEvent) => { onClick?.(event); check() },
      onKeyUp: (event: FieldKeyEvent) => { onKeyUp?.(event); check() },
    },
  }
}
