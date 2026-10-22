import { Select } from '../index.js'

const COUNTRIES = [{ value: 'jo', label: 'Jordan' }, { value: 'eg', label: 'Egypt' }, { value: 'ma', label: 'Morocco' }]

/** The ring a focused trigger wears, and an open one keeps, drawn at rest so the strip can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = 'w-32 not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** The trigger the frame draws in each cell, 128 px. */
const CELL = 'w-32'

/** The line a hovered trigger draws, at rest, on the frame's 128 px trigger. */
const HOVER = 'w-32 border-body'

/** The frame's strip, one cell a state named by its aria-label; the open cell is the trigger the frame draws, its list
 * left shut so it covers no cell. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <Select className={CELL} aria-label="idle" placeholder="Country" items={COUNTRIES} />
      <Select className={HOVER} aria-label="hover" placeholder="Country" items={COUNTRIES} />
      <Select className={RING} aria-label="focus-visible" items={COUNTRIES} defaultValue="jo" />
      <Select className={RING} aria-label="open" items={COUNTRIES} defaultValue="jo" />
      <Select className={CELL} aria-label="disabled" disabled placeholder="Country" items={COUNTRIES} />
      <Select className={CELL} aria-label="invalid" invalid items={COUNTRIES} defaultValue="jo" />
    </div>
  )
}
