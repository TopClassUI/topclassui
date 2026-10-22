import { Rating } from '../index.js'

/** The ring the focused star wears, drawn at rest on the third so the strip can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = '*:nth-3:not-forced-colors:outline-solid *:nth-3:not-forced-colors:outline-(length:--tc-ring-width) *:nth-3:not-forced-colors:outline-offset-(length:--tc-ring-offset) *:nth-3:not-forced-colors:outline-ring'

/** The frame's strip, one cell a state named by its aria-label (a group around the read-only stars, whose own name is the
 * score): none, three and all of the stars, a hover preview of four, the focused third star, read-only; small, as drawn. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div role="group" aria-label="empty" className="flex"><Rating size="xs" value={0} /></div>
      <div role="group" aria-label="partial" className="flex"><Rating size="xs" value={3} /></div>
      <div role="group" aria-label="full" className="flex"><Rating size="xs" value={5} /></div>
      <div role="group" aria-label="hover" className="flex"><Rating size="xs" value={4} /></div>
      <div role="group" aria-label="focus-visible" className="flex"><Rating size="xs" value={3} className={RING} /></div>
      <div role="group" aria-label="read-only" className="flex"><Rating size="xs" value={3} /></div>
    </div>
  )
}
