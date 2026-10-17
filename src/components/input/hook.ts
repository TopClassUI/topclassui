'use client'

import { useRef } from 'react'

import { useValueCheck } from '#shared/value-check/hook.js'
import type { InputCheckValueProps } from './types.js'

/** The holder's one hook: it finds the input inside its span and holds its value to the rules. */
export function useInputCheck({ rules }: InputCheckValueProps) {
  const ref = useRef(null as HTMLSpanElement | null)
  useValueCheck({ field: () => ref.current?.querySelector('input'), rules })
  return { ref }
}
