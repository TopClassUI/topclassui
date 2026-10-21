import type { CSSProperties } from 'react'

import { Combobox } from '../index.js'

const COUNTRIES = [{ value: 'jo', label: 'Jordan' }, { value: 'jv', label: 'Jordan Valley' }, { value: 'eg', label: 'Egypt' }]

/** The field as wide as the frame's cells draw it. */
const CELL = { '--tc-input-width': '8rem' } as CSSProperties

/** One cell per state the Previewer frame draws that a closed combobox can show, in its order, named by its aria-label.
 * Its focus-visible, open and empty cells draw the input and the list inside the root, which no class from outside reaches. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Combobox aria-label="idle" placeholder="Search" items={COUNTRIES} style={CELL} />
      <Combobox aria-label="loading" status="loading" items={[]} defaultInputValue="jor" style={CELL} />
      <Combobox aria-label="disabled" disabled placeholder="Search" items={COUNTRIES} style={CELL} />
    </div>
  )
}
