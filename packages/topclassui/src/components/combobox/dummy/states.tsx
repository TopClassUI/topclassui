import { Combobox } from '../index.js'

const COUNTRIES = [
  { value: 'jo', label: 'Jordan' },
  { value: 'eg', label: 'Egypt' },
  { value: 'ma', label: 'Morocco', disabled: true },
  { value: 'sa', label: 'Saudi Arabia' },
]

/** The ring a focused input wears, and an open one keeps, drawn at rest so the strip can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = 'not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** The frame's strip, one cell a state named by its aria-label, each input filling a track; the open and empty cells are
 * the inputs the frame draws, their lists left shut so they cover no cell. Then invalid, read-only and one disabled option. */
export default function Demo() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] items-start gap-6">
      <Combobox fullWidth aria-label="idle" placeholder="Search" items={COUNTRIES} />
      <Combobox fullWidth aria-label="focus-visible" items={COUNTRIES} defaultValue="jo" className={RING} />
      <Combobox fullWidth aria-label="open" items={COUNTRIES} defaultInputValue="jor" className={RING} />
      <Combobox fullWidth aria-label="loading" status="loading" items={[]} defaultInputValue="jor" />
      <Combobox fullWidth aria-label="empty" items={COUNTRIES} defaultInputValue="zzz" />
      <Combobox fullWidth aria-label="disabled" disabled placeholder="Search" items={COUNTRIES} />
      <Combobox fullWidth aria-label="invalid" invalid items={COUNTRIES} defaultValue="jo" />
      <Combobox fullWidth aria-label="read-only" readOnly items={COUNTRIES} defaultValue="sa" />
      <Combobox fullWidth aria-label="one option disabled" items={COUNTRIES} />
    </div>
  )
}
