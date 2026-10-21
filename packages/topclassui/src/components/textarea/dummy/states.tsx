import { Textarea } from '../index.js'

/** The ring a focused field wears, drawn at rest so the strip can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = 'not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** The line a hovered field draws, at rest. */
const HOVER = 'border-body'

/** The frame's strip, one cell a state named by its aria-label (the counted field wears a wrapper, so a group names its cell), each field filling a track so none spills into the next. */
export default function Demo() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] items-start gap-6">
      <Textarea fullWidth rows={2} placeholder="Message" aria-label="idle" />
      <Textarea fullWidth rows={2} defaultValue="Message" aria-label="hover" className={HOVER} />
      <Textarea fullWidth rows={2} defaultValue="Message" aria-label="focus-visible" className={RING} />
      <Textarea fullWidth rows={2} disabled placeholder="Message" aria-label="disabled" />
      <Textarea fullWidth rows={2} invalid defaultValue="Message" aria-label="invalid" />
      <div role="group" aria-label="at limit">
        <Textarea fullWidth rows={2} showCount maxLength={7} defaultValue="Message" aria-label="Message at its limit" />
      </div>
    </div>
  )
}
