import { Children, type ReactNode } from 'react'

import { LABEL } from './classes.js'

const isText = (part: ReactNode): part is string | number =>
  typeof part === 'string' || typeof part === 'number'

let graphemes: Intl.Segmenter | undefined

/** At most `maxLength` UTF-16 units, cut between two graphemes: never inside an emoji, a flag,
 * a combining mark or an Arabic letter and its harakat. A label within the bound comes back whole. */
export function cutLabel(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  graphemes ??= new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  // Two units past the bound hold the whole code point that decides whether the bound is a break.
  let end = 0
  for (const { index, segment } of graphemes.segment(text.slice(0, maxLength + 2))) {
    if (index + segment.length > maxLength) break
    end = index + segment.length
  }
  return text.slice(0, end)
}

/** R-5.2-7: one span per run of text, so `{n} items` stays one flex item and truncates.
 * `maxLength` bounds the string itself; dir="auto" puts the ellipsis at the end of the label's own direction. */
export function truncateLabel(children: ReactNode, maxLength: number): ReactNode {
  const parts = Children.toArray(children)
  if (parts.length === 0) return children

  const out: ReactNode[] = []
  let run = ''

  const flush = () => {
    if (run === '') return
    const text = cutLabel(run, maxLength)
    out.push(<span key={`label-${String(out.length)}`} dir="auto" className={LABEL}>{text}</span>)
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
