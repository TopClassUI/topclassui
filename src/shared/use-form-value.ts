'use client'

import { type RefObject, useEffect, useRef } from 'react'

import { useControllableState } from './use-controllable-state.js'

/** Writes what a reset cannot: the `checked` of a checkbox or radio input, which React leaves alone when its state did not change. */
export type FormValueSync<T> = (value: T, input: HTMLInputElement | null, root: HTMLDivElement | null) => void

export interface FormValueOptions<T> {
  /** The caller's controlled value, or undefined. */
  value?: T | undefined
  /** The default of this render: a reset returns to the latest one, never the first. */
  defaultValue: T
  sync?: FormValueSync<T> | undefined
}

export interface FormValue<T> {
  value: T
  /** Does nothing while the caller controls the value. */
  setValue: (next: T) => void
  inputRef: RefObject<HTMLInputElement | null>
  rootRef: RefObject<HTMLDivElement | null>
}

/** The form an input names with its `form` attribute counts, so a control outside its form still resets with it. */
function findForm(input: HTMLInputElement | null, root: HTMLDivElement | null): HTMLFormElement | null {
  return input?.form ?? root?.querySelector('input')?.form ?? root?.closest('form') ?? null
}

/** The value of a form control that follows its form's reset to the default of the latest render (unit-4.md, "A form reset"). */
export function useFormValue<T>({ value, defaultValue, sync }: FormValueOptions<T>): FormValue<T> {
  const [current, setValue] = useControllableState({ value, defaultValue })
  const inputRef = useRef(null as HTMLInputElement | null)
  const rootRef = useRef(null as HTMLDivElement | null)

  // Read when the reset lands, so a default that changed since mount (a Server Action's answer) is the one restored.
  const latest = useRef({ value, defaultValue, sync })
  latest.current = { value, defaultValue, sync }

  // Found again after every commit: a `form` prop that changed, or an input that mounted late, names another owner.
  const bound = useRef(null as { form: HTMLFormElement; release: () => void } | null)
  useEffect(() => {
    const form = findForm(inputRef.current, rootRef.current)
    if (bound.current?.form === form) return
    bound.current?.release()
    bound.current = form ? { form, release: listen(form) } : null
  })
  useEffect(() => () => {
    bound.current?.release()
    bound.current = null
  }, [])

  /** Listens to one form's reset until the returned function is called. */
  function listen(form: HTMLFormElement): () => void {
    let timer: ReturnType<typeof setTimeout> | undefined

    const onReset = (event: Event) => {
      if (event.target !== form) return
      // The event fires before the browser puts the inputs back, so the write waits for it.
      timer = setTimeout(() => {
        if (event.defaultPrevented) return
        const { value: controlled, defaultValue: fallback, sync: write } = latest.current
        if (controlled === undefined) setValue(fallback)
        write?.(controlled === undefined ? fallback : controlled, inputRef.current, rootRef.current)
      }, 0)
    }

    form.addEventListener('reset', onReset)
    return () => {
      form.removeEventListener('reset', onReset)
      clearTimeout(timer)
    }
  }

  return { value: current, setValue, inputRef, rootRef }
}
