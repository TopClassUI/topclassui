import { Input } from '../index.js'

/** The ring a focused field wears, drawn at rest so the strip can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = 'not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** The line a hovered field draws, at rest. */
const HOVER = 'border-body'

/** The frame's strip, one cell a state named by its aria-label, each field filling a track so none spills into the next. */
export default function Demo() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] items-start gap-6">
      <Input fullWidth placeholder="Email" aria-label="idle" />
      <Input fullWidth placeholder="Email" aria-label="hover" className={HOVER} />
      <Input fullWidth defaultValue="you@mail.com" aria-label="focus-visible" className={RING} />
      <Input fullWidth disabled placeholder="Email" aria-label="disabled" />
      <Input fullWidth readOnly defaultValue="you@mail.com" aria-label="read-only" />
      <Input fullWidth invalid defaultValue="you@mail" aria-label="invalid" />
    </div>
  )
}
