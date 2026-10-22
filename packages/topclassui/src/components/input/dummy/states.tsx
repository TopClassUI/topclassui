import { Input } from '../index.js'

/** The ring a focused field wears, drawn at rest so the strip can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = 'w-32 not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** The line a hovered field draws, at rest, on the frame's 128 px field. */
const HOVER = 'w-32 border-body'

/** The field the frame draws in each cell, 128 px. */
const CELL = 'w-32'

/** The frame's strip, one cell a state named by its aria-label. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <Input className={CELL} placeholder="Email" aria-label="idle" />
      <Input className={HOVER} placeholder="Email" aria-label="hover" />
      <Input className={RING} defaultValue="you@mail.com" aria-label="focus-visible" />
      <Input className={CELL} disabled placeholder="Email" aria-label="disabled" />
      <Input className={CELL} readOnly defaultValue="you@mail.com" aria-label="read-only" />
      <Input className={CELL} invalid defaultValue="you@mail" aria-label="invalid" />
    </div>
  )
}
