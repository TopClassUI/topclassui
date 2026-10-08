import { Children, type ReactNode } from 'react'

import { LABEL } from './classes.js'

const isText = (part: ReactNode): part is string | number =>
  typeof part === 'string' || typeof part === 'number'

/** R-5.2-7: one span per run of text, so `{n} items` stays one flex item and truncates.
 * `maxLength` bounds the string itself; the component passes its own boundary. */
export function truncateLabel(children: ReactNode, maxLength: number): ReactNode {
  const parts = Children.toArray(children)
  if (parts.length === 0) return children

  const out: ReactNode[] = []
  let run = ''

  const flush = () => {
    if (run === '') return
    const text = run.slice(0, maxLength)
    out.push(<span key={`label-${String(out.length)}`} className={LABEL}>{text}</span>)
    run = ''
  }

  for (const part of parts) {
    if (isText(part)) { run += String(part); continue }
    flush()
    out.push(part)
  }
  flush()

  return out
}
