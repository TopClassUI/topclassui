import { RadioGroupItem, RadioGroupRoot } from '../index.js'

/** The ring a focused radio wears on focus-visible, drawn at rest so the strip can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = 'rounded-full not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** One cell per state the strip draws, a group of one bare radio named by the group's aria-label. A radio has no hover
 * look, so hover is drawn identical to unselected; read-only and the combined states are in the combined demo. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <RadioGroupRoot aria-label="unselected">
        <RadioGroupItem value="monthly" aria-label="Monthly" className="gap-0" />
      </RadioGroupRoot>
      <RadioGroupRoot aria-label="selected" defaultValue="monthly">
        <RadioGroupItem value="monthly" aria-label="Monthly" className="gap-0" />
      </RadioGroupRoot>
      <RadioGroupRoot aria-label="hover">
        <RadioGroupItem value="monthly" aria-label="Monthly" className="gap-0" />
      </RadioGroupRoot>
      <RadioGroupRoot aria-label="focus-visible">
        <RadioGroupItem value="monthly" aria-label="Monthly" className={`gap-0 ${RING}`} />
      </RadioGroupRoot>
      <RadioGroupRoot aria-label="disabled" disabled>
        <RadioGroupItem value="monthly" aria-label="Monthly" className="gap-0" />
      </RadioGroupRoot>
      <RadioGroupRoot aria-label="invalid" invalid>
        <RadioGroupItem value="monthly" aria-label="Monthly" className="gap-0" />
      </RadioGroupRoot>
    </div>
  )
}
