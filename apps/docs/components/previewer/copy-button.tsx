'use client'

// The card's copy buttons (S8): "Copy" over the code and the icon in each install field, as the Previewer frames draw them.
import { useEffect, useRef, useState } from 'react'
import { Button } from 'topclassui/button'
import { Svg } from 'topclassui/svg'
import { check } from 'topclassui/icons/check'
import { copy } from 'topclassui/icons/copy'

export interface CopyButtonProps {
  text: string
  /** The accessible name, which says what is copied. */
  label: string
  /** The visible word beside the icon; without it the button is the icon alone. */
  word?: string
  copied: string
  failed: string
  /** Merged after the button's own classes: a copy field sizes the icon button it holds. */
  className?: string
}

type Result = 'idle' | 'copied' | 'failed'

export function CopyButton({ text, label, word, copied, failed, className }: CopyButtonProps) {
  const [result, setResult] = useState<Result>('idle')
  const [presses, setPresses] = useState(0)
  const timer = useRef(0)
  useEffect(() => () => { window.clearTimeout(timer.current) }, [])

  const press = async () => {
    window.clearTimeout(timer.current)
    setResult('idle')
    setPresses((count) => count + 1)
    let next: Result = 'failed'
    try {
      // Undefined outside a secure context, though the DOM types say it always exists.
      const clipboard = navigator.clipboard as Clipboard | undefined
      if (clipboard !== undefined) {
        await clipboard.writeText(text)
        next = 'copied'
      }
    } catch {
      next = 'failed'
    }
    setResult(next)
    timer.current = window.setTimeout(() => { setResult('idle') }, 2000)
  }

  return (
    <>
      <Button
        variant={word === undefined ? 'ghost' : 'outline'}
        tone="neutral"
        size={word === undefined ? 'sm' : 'xs'}
        aria-label={label}
        data-copied={result === 'copied' ? '' : undefined}
        className={`shrink-0 ${word === undefined ? '' : 'gap-1.5 border-line bg-surface px-2.5'} ${className ?? ''}`}
        onClick={() => { void press() }}
      >
        <Svg icon={result === 'copied' ? check : copy} size="0.875rem" className={result === 'copied' ? undefined : 'text-muted'} aria-hidden="true" />
        {word === undefined ? null : <span aria-hidden="true">{word}</span>}
      </Button>
      <span role="status" className="sr-only">
        <span key={presses}>{result === 'copied' ? copied : result === 'failed' ? failed : ''}</span>
      </span>
    </>
  )
}
