'use client'

import { INPUT_CHECK } from './classes.js'
import { useInputCheck } from './hook.js'
import type { InputCheckProps } from './types.js'

/** The holder around the server's input: it never clones it and passes it nothing, and draws no box. */
export function InputCheck({ rules, children }: InputCheckProps) {
  const check = useInputCheck({ rules })
  return <span ref={check.ref} className={INPUT_CHECK}>{children}</span>
}
