import { Combobox } from '../index.js'

const COUNTRIES = [
  { value: 'jo', label: 'Jordan' },
  { value: 'eg', label: 'Egypt' },
  { value: 'ma', label: 'Morocco', disabled: true },
  { value: 'sa', label: 'Saudi Arabia' },
]

/** The ring a focused input wears, and an open one keeps, drawn at rest so the strip can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = 'w-32 not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** The input the frame draws in each cell, 128 px. */
const CELL = 'w-32'

/** The frame's strip, one cell a state named by its aria-label; the open and empty cells are the inputs the frame draws,
 * their lists left shut so they cover no cell, the empty one with the words its list would say. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <Combobox className={CELL} aria-label="idle" placeholder="Search" items={COUNTRIES} />
      <Combobox className={RING} aria-label="focus-visible" items={COUNTRIES} defaultValue="jo" />
      <Combobox className={RING} aria-label="open" items={COUNTRIES} defaultInputValue="jor" />
      <Combobox className={CELL} aria-label="loading" status="loading" items={[]} defaultInputValue="jor" />
      <div role="group" aria-label="empty" className="grid justify-items-center gap-0.5">
        <Combobox className={CELL} aria-label="Country, nothing matches" items={COUNTRIES} defaultInputValue="zzz" />
        <span className="font-mono text-xs/3.5 text-muted">no matches</span>
      </div>
      <Combobox className={CELL} aria-label="disabled" disabled placeholder="Search" items={COUNTRIES} />
    </div>
  )
}
