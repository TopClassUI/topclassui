import { Children, type ReactNode } from 'react'

import { LABEL } from '#shared/classes.js'
import { BADGE_BOUNDARIES } from './boundaries.js'

const isText = (part: ReactNode): part is string | number =>
  typeof part === 'string' || typeof part === 'number'

/** Button's truncateLabel, copied until both lift into shared/ (no Unit 1 component may
 * import another). One span per run of text, so `{n} new` stays one flex item. */
export function truncateLabel(children: ReactNode): ReactNode {
  const parts = Children.toArray(children)
  if (parts.length === 0) return children

  const out: ReactNode[] = []
  let run = ''

  const flush = () => {
    if (run === '') return
    const text = run.slice(0, BADGE_BOUNDARIES.labelMaxLength)
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
