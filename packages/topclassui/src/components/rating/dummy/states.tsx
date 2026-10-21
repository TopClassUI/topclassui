import { Rating } from '../index.js'

/** The ring the focused star wears, drawn at rest on the third so the strip can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = '*:nth-3:not-forced-colors:outline-solid *:nth-3:not-forced-colors:outline-(length:--tc-ring-width) *:nth-3:not-forced-colors:outline-offset-(length:--tc-ring-offset) *:nth-3:not-forced-colors:outline-ring'

/** The frame's strip, one cell a state named by its aria-label (a group around the read-only stars, whose own name is the
 * score): none, half and all of the stars, a hover preview of four, the focused third star, read-only. Then disabled. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div role="group" aria-label="empty" className="flex"><Rating value={0} /></div>
      <div role="group" aria-label="partial" className="flex"><Rating value={3.5} /></div>
      <div role="group" aria-label="full" className="flex"><Rating value={5} /></div>
      <Rating readOnly={false} defaultValue={4} aria-label="hover" />
      <Rating readOnly={false} defaultValue={3} aria-label="focus-visible" className={RING} />
      <div role="group" aria-label="read-only" className="flex"><Rating value={3} /></div>
      <Rating readOnly={false} disabled defaultValue={2} aria-label="disabled" />
    </div>
  )
}
