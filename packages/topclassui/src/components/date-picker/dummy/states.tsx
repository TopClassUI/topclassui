import { DatePicker } from '../index.js'

/** The ring a focused trigger wears, and an open one keeps, drawn at rest so the strip can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = 'not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** The frame's strip, one cell a state named by its aria-label, each trigger filling a track; the open cell is the trigger
 * the frame draws, its calendar left shut so it covers no cell, and today is the trigger holding the day the calendar marks. */
export default function Demo() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(10rem,100%),1fr))] items-start gap-6">
      <DatePicker fullWidth aria-label="idle" />
      <DatePicker fullWidth aria-label="open" defaultValue="2026-09-22" className={RING} />
      <DatePicker fullWidth aria-label="selected" defaultValue="2026-09-22" />
      <DatePicker fullWidth aria-label="today" defaultValue="2026-09-22" />
      <DatePicker fullWidth aria-label="disabled" disabled />
      <DatePicker fullWidth aria-label="invalid" invalid />
    </div>
  )
}
