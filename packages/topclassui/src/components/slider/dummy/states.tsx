import type { CSSProperties } from 'react'

import { Slider } from '../index.js'

/** The track as wide as the frame's cells draw it. */
const CELL = { '--tc-input-width': '7rem' } as CSSProperties

/** One cell per state the Previewer frame draws, named by its aria-label. Hover and active are drawn as the frame draws them,
 * the same knob as idle; the frame's focus-visible ring sits on the knob, which no class from outside reaches. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Slider aria-label="idle" defaultValue={40} style={CELL} />
      <Slider aria-label="hover" defaultValue={40} style={CELL} />
      <Slider aria-label="active" defaultValue={40} style={CELL} />
      <Slider aria-label="disabled" disabled defaultValue={40} style={CELL} />
      <Slider aria-label="invalid" invalid defaultValue={40} style={CELL} />
    </div>
  )
}
