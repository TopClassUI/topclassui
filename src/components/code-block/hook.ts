'use client'

import { useEffect, useId, useRef, useState } from 'react'

import { COPY_RESET_MS } from './constants.js'

type CopyResult = 'idle' | 'copied' | 'failed'

/** The button's id, the result of the last press, and the press itself. A missing clipboard (an
 * insecure context), a throw and a refusal all say failed. Each result clears after COPY_RESET_MS. */
export function useCodeBlockCopy(code: string) {
  const id = useId()
  const [result, setResult] = useState('idle' as CopyResult)
  // A browser timer id is never 0, so clearing 0 clears nothing.
  const timer = useRef(0)

  useEffect(() => () => { window.clearTimeout(timer.current) }, [])

  const copy = async () => {
    window.clearTimeout(timer.current)
    // Emptied first, so a second press within the time is announced again.
    setResult('idle')
    let next: CopyResult = 'failed'
    try {
      // Undefined outside a secure context, though the DOM types say it always exists.
      const clipboard = navigator.clipboard as Clipboard | undefined
      if (clipboard !== undefined) {
        await clipboard.writeText(code)
        next = 'copied'
      }
    } catch {
      next = 'failed'
    }
    setResult(next)
    timer.current = window.setTimeout(() => { setResult('idle') }, COPY_RESET_MS)
  }

  return { id, result, copy }
}
