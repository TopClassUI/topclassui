import { Select } from '../index.js'

const COUNTRIES = [{ value: 'jo', label: 'Jordan' }, { value: 'eg', label: 'Egypt' }, { value: 'ma', label: 'Morocco' }]

/** The ring a focused trigger wears, and an open one keeps, drawn at rest so the strip can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = 'not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** The line a hovered trigger draws, at rest. */
const HOVER = 'border-body'

/** The frame's strip, one cell a state named by its aria-label, each trigger filling a track; the open cell is the trigger
 * the frame draws, its list left shut so it covers no cell. Read-only, which the frame leaves out, looks like idle. */
export default function Demo() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(8rem,100%),1fr))] items-start gap-6">
      <Select fullWidth aria-label="idle" placeholder="Country" items={COUNTRIES} />
      <Select fullWidth aria-label="hover" placeholder="Country" items={COUNTRIES} className={HOVER} />
      <Select fullWidth aria-label="focus-visible" items={COUNTRIES} defaultValue="jo" className={RING} />
      <Select fullWidth aria-label="open" items={COUNTRIES} defaultValue="jo" className={RING} />
      <Select fullWidth aria-label="disabled" disabled placeholder="Country" items={COUNTRIES} />
      <Select fullWidth aria-label="invalid" invalid items={COUNTRIES} defaultValue="jo" />
      <Select fullWidth aria-label="read-only" readOnly items={COUNTRIES} defaultValue="jo" />
    </div>
  )
}
