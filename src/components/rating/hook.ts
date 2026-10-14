'use client'

import { useCallback, useId, useState } from 'react'

import { useControllableState } from '#shared/use-controllable-state.js'
import type { RatingFieldOptions, RatingRadioChange, RatingRowLeave } from './types.js'

/** The checked step, the hovered one, and a name, so the radios are one group even when the caller gives none. */
export function useRatingField({ value, defaultValue, onValueChange, name, disabled, onPointerLeave }: RatingFieldOptions) {
  const own = useId()
  const [checked, setChecked] = useControllableState({ value, defaultValue, onChange: onValueChange })
  const [hovered, setHovered] = useState(null as number | null)
  // A native reset puts each radio back as the server wrote it: the step checked on the first render.
  const [first] = useState(checked)

  const watchForm = useCallback((input: HTMLInputElement | null) => {
    const form = input?.form
    if (!form) return undefined
    const onReset = () => { setHovered(null); setChecked(first) }
    form.addEventListener('reset', onReset)
    return () => { form.removeEventListener('reset', onReset) }
  }, [first, setChecked])

  return {
    name: name ?? own,
    checked,
    /** What the stars show: the hovered step while the pointer is on one, the checked step otherwise. */
    shown: hovered ?? checked,
    watchForm,
    select: (event: RatingRadioChange) => { setChecked(Number(event.currentTarget.value)) },
    enter: (step: number) => () => { if (!disabled) setHovered(step) },
    leave: (event: RatingRowLeave) => { setHovered(null); onPointerLeave?.(event) },
  }
}
