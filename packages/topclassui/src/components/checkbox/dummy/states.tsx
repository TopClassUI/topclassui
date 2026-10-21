import { Checkbox } from '../index.js'

/** The ring a focused box wears on focus-visible, drawn at rest so the strip can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = 'rounded-chip not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** One cell per state the strip draws, named by its aria-label. A box has no hover look, so hover is drawn identical to
 * unchecked; invalid, read-only and the combined states are in the combined demo. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Checkbox aria-label="unchecked" />
      <Checkbox defaultChecked aria-label="checked" />
      <Checkbox indeterminate aria-label="indeterminate" />
      <Checkbox aria-label="hover" />
      <Checkbox className={RING} aria-label="focus-visible" />
      <Checkbox disabled aria-label="disabled" />
    </div>
  )
}
