'use client'

import { useCallback, useRef, useState } from 'react'

/**
 * R-5.7-1: every stateful component works controlled and uncontrolled. Passing the
 * prop makes it controlled for the life of the component; the default only seeds it.
 */
export function useControllableState<T>(options: {
  value?: T | undefined
  defaultValue: T
  onChange?: ((value: T) => void) | undefined
}): [T, (next: T) => void] {
  const { value, defaultValue, onChange } = options
  const isControlled = value !== undefined

  const [uncontrolled, setUncontrolled] = useState<T>(defaultValue)

  // A ref keeps setValue stable, so a child memoised on it does not re-render.
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const controlledRef = useRef(isControlled)
  if (process.env['NODE_ENV'] !== 'production' && controlledRef.current !== isControlled) {
    console.warn(
      `A component switched from ${controlledRef.current ? 'controlled' : 'uncontrolled'} to ` +
        `${isControlled ? 'controlled' : 'uncontrolled'}. Pass the prop from the first render, or never.`,
    )
    controlledRef.current = isControlled
  }

  const setValue = useCallback(
    (next: T) => {
      if (!controlledRef.current) setUncontrolled(next)
      onChangeRef.current?.(next)
    },
    [],
  )

  return [isControlled ? value : uncontrolled, setValue]
}
