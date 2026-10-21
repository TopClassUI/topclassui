import { Rating } from '../index.js'

/** The ring the frame draws round the stars of a focused rating, drawn at rest; not under forced colours, where a ring at rest would read as focus. */
const RING = 'rounded-chip not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** One cell per state the Previewer frame draws, in its order, captioned by its title: read-only stars at none, three and five,
 * then the radio group as a pointer over the fourth star leaves it, focused, and read-only at three. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div title="empty"><Rating value={0} /></div>
      <div title="partial"><Rating value={3} /></div>
      <div title="full"><Rating value={5} /></div>
      <div title="hover"><Rating readOnly={false} defaultValue={4} aria-label="Rate this course" /></div>
      <div title="focus-visible"><Rating readOnly={false} defaultValue={3} aria-label="Rate this course" className={RING} /></div>
      <div title="read-only"><Rating value={3} /></div>
    </div>
  )
}
