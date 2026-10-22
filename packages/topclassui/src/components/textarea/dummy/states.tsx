import { Textarea } from '../index.js'

/** The ring a focused field wears, drawn at rest so the strip can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = 'w-32 max-w-full min-w-0 resize-none not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** The field the frame draws in each cell: 128 px, with no grip. */
const CELL = 'w-32 max-w-full min-w-0 resize-none'

/** The line a hovered field draws, at rest, on the frame's 128 px field. */
const HOVER = 'w-32 max-w-full min-w-0 resize-none border-body'

/** The frame's strip, one cell a state named by its aria-label; the counted field wears a wrapper, so a group names its cell. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <Textarea className={CELL} rows={1} placeholder="Message" aria-label="idle" />
      <Textarea className={HOVER} rows={1} defaultValue="Message" aria-label="hover" />
      <Textarea className={RING} rows={1} defaultValue="Message" aria-label="focus-visible" />
      <Textarea className={CELL} rows={1} disabled defaultValue="Message" aria-label="disabled" />
      <Textarea className={CELL} rows={1} invalid defaultValue="Message" aria-label="invalid" />
      <div role="group" aria-label="at limit" className="w-32 max-w-full min-w-0">
        <Textarea className="w-full min-w-0 resize-none" rows={1} showCount maxLength={7} defaultValue="Message" aria-label="Message at its limit" />
      </div>
    </div>
  )
}
