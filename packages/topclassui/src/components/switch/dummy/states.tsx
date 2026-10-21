import { Switch } from '../index.js'

/** The ring a focused switch wears on focus-visible, drawn at rest so the strip can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = 'rounded-full not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** One cell per state the strip draws, named by its aria-label. A track has no hover look, so hover is drawn identical to
 * off; read-only and the combined states are in the combined demo. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Switch aria-label="off" />
      <Switch defaultChecked aria-label="on" />
      <Switch aria-label="hover" />
      <Switch className={RING} aria-label="focus-visible" />
      <Switch disabled aria-label="disabled" />
      <Switch invalid aria-label="invalid" />
    </div>
  )
}
