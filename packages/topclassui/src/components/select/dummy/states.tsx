import type { CSSProperties } from 'react'

import { Select } from '../index.js'

const COUNTRIES = [{ value: 'jo', label: 'Jordan' }, { value: 'eg', label: 'Egypt' }, { value: 'ma', label: 'Morocco' }]

/** The field as wide as the frame's cells draw it. */
const CELL = { '--tc-input-width': '8rem' } as CSSProperties

/** One cell per state the Previewer frame draws that a closed select can show, in its order, named by its aria-label.
 * Its hover, focus-visible and open cells draw the trigger inside the root, which no class from outside reaches. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Select aria-label="idle" placeholder="Country" items={COUNTRIES} style={CELL} />
      <Select aria-label="disabled" disabled placeholder="Country" items={COUNTRIES} style={CELL} />
      <Select aria-label="invalid" invalid items={COUNTRIES} defaultValue="jo" style={CELL} />
    </div>
  )
}
