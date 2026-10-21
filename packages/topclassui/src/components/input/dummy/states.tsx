import type { CSSProperties } from 'react'

import { Input } from '../index.js'

/** The field as wide as the frame's cells draw it. */
const CELL = { '--tc-input-width': '8rem' } as CSSProperties

/** The line under the pointer and the ring of focus-visible, drawn at rest as the live states draw them; not under forced colours, where a ring at rest would read as focus. */
const HOVER = 'border-body'
const RING = 'not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** One cell per state the Previewer frame draws, in its order, named by its aria-label. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Input placeholder="Email" aria-label="idle" style={CELL} />
      <Input placeholder="Email" aria-label="hover" className={HOVER} style={CELL} />
      <Input defaultValue="you@mail.com" aria-label="focus-visible" className={RING} style={CELL} />
      <Input disabled placeholder="Email" aria-label="disabled" style={CELL} />
      <Input readOnly defaultValue="you@mail.com" aria-label="read-only" style={CELL} />
      <Input invalid defaultValue="you@mail.com" aria-label="invalid" style={CELL} />
    </div>
  )
}
