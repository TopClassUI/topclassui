import { Slider } from '../index.js'

/** The ring a focused thumb wears on focus-visible, drawn on the knob at rest so the strip can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = 'not-forced-colors:**:data-index:*:outline-solid not-forced-colors:**:data-index:*:outline-(length:--tc-ring-width) not-forced-colors:**:data-index:*:outline-offset-(length:--tc-ring-offset) not-forced-colors:**:data-index:*:outline-ring'

/** One cell per state the strip draws, named by its aria-label, each slider narrow enough for its cell. A thumb has no
 * hover or pressed look, so hover and active are drawn identical to idle; the invalid range is in the combined demo. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Slider aria-label="idle" defaultValue={60} className="w-36" />
      <Slider aria-label="hover" defaultValue={60} className="w-36" />
      <Slider aria-label="active" defaultValue={60} className="w-36" />
      <Slider aria-label="focus-visible" defaultValue={60} className={`w-36 ${RING}`} />
      <Slider aria-label="disabled" disabled defaultValue={60} className="w-36" />
      <Slider aria-label="invalid" invalid defaultValue={60} className="w-36" />
    </div>
  )
}
