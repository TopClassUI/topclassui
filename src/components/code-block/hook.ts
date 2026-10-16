'use client'

import { useEffect, useId, useRef, useState } from 'react'

import { COPY_RESET_MS } from './constants.js'

type CopyResult = 'idle' | 'copied' | 'failed'

/** The button's id, the result of the last press, a count of presses, and the press itself. A missing clipboard
 * (an insecure context), a throw and a refusal all say failed. Each result clears after COPY_RESET_MS. */
export function useCodeBlockCopy(code: string) {
  const id = useId()
  const [result, setResult] = useState('idle' as CopyResult)
  const [presses, setPresses] = useState(0)
  // A browser timer id is never 0, so clearing 0 clears nothing.
  const timer = useRef(0)

  useEffect(() => () => { window.clearTimeout(timer.current) }, [])

  const copy = async () => {
    window.clearTimeout(timer.current)
    // Emptied first; when no await runs below both land in one render, so the count gives the words a new node to read again.
    setResult('idle')
    setPresses((count) => count + 1)
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

  return { id, result, presses, copy }
}
