import type { CSSProperties } from 'react'

import { Textarea } from '../index.js'

/** The field as wide as the frame's cells draw it. */
const CELL = { '--tc-input-width': '8rem' } as CSSProperties

/** The line under the pointer and the ring of focus-visible, drawn at rest as the live states draw them; not under forced colours, where a ring at rest would read as focus. */
const HOVER = 'border-body'
const RING = 'not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** One cell per state the Previewer frame draws, in its order, named by its aria-label. At its limit the count turns bold, not red (2026-10-19). */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <Textarea rows={2} placeholder="Message" aria-label="idle" style={CELL} />
      <Textarea rows={2} defaultValue="Message" aria-label="hover" className={HOVER} style={CELL} />
      <Textarea rows={2} defaultValue="Message" aria-label="focus-visible" className={RING} style={CELL} />
      <Textarea rows={2} disabled placeholder="Message" aria-label="disabled" style={CELL} />
      <Textarea rows={2} invalid defaultValue="Message" aria-label="invalid" style={CELL} />
      <Textarea rows={2} showCount maxLength={7} defaultValue="Message" aria-label="at limit" style={CELL} />
    </div>
  )
}
