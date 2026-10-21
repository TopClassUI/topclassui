import type { CSSProperties } from 'react'

import { NumberField } from '../index.js'

/** The field as wide as the frame's cells draw it. */
const CELL = { '--tc-input-width': '8rem' } as CSSProperties

/** One cell per state the Previewer frame draws, in its order, named by its aria-label. Its hover and focus-visible
 * cells draw the line and the ring of the group inside the root, which no class from outside reaches. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <NumberField defaultValue={12} aria-label="idle" style={CELL} />
      <NumberField max={99} defaultValue={99} aria-label="at-limit" style={CELL} />
      <NumberField invalid defaultValue={12} aria-label="invalid" style={CELL} />
      <NumberField disabled defaultValue={12} aria-label="disabled" style={CELL} />
    </div>
  )
}
