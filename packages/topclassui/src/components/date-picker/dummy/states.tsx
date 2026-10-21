import type { CSSProperties } from 'react'

import { DatePicker } from '../index.js'

/** The field as wide as the frame's cells draw it. */
const CELL = { '--tc-input-width': '8rem' } as CSSProperties

/** One cell per state the Previewer frame draws that a closed picker can show, in its order, named by its aria-label.
 * Its open cell rings the trigger inside the root, which no class from outside reaches; today is a date the page cannot know. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <DatePicker aria-label="idle" placeholder="Pick a date" style={CELL} />
      <DatePicker aria-label="selected" defaultValue="2026-09-22" style={CELL} />
      <DatePicker aria-label="disabled" disabled placeholder="Pick a date" style={CELL} />
      <DatePicker aria-label="invalid" invalid placeholder="Pick a date" style={CELL} />
    </div>
  )
}
