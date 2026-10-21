import { RadioGroupItem, RadioGroupRoot } from '../index.js'

/** The ring a radio wears on focus-visible, drawn at rest round the 24 px target the md circle fills; not under forced colours, where a ring at rest would read as focus. */
const RING = 'rounded-full not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** One cell per state the Previewer frame draws, each a group of one radio named by its aria-label. Hover is drawn as the frame draws it, the same as unselected. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <RadioGroupRoot aria-label="unselected"><RadioGroupItem value="plan" aria-label="Monthly" /></RadioGroupRoot>
      <RadioGroupRoot aria-label="selected" defaultValue="plan"><RadioGroupItem value="plan" aria-label="Yearly" /></RadioGroupRoot>
      <RadioGroupRoot aria-label="hover"><RadioGroupItem value="plan" aria-label="Monthly" /></RadioGroupRoot>
      <RadioGroupRoot aria-label="focus-visible"><RadioGroupItem value="plan" aria-label="Monthly" className={RING} /></RadioGroupRoot>
      <RadioGroupRoot aria-label="disabled" disabled><RadioGroupItem value="plan" aria-label="Monthly" /></RadioGroupRoot>
      <RadioGroupRoot aria-label="invalid" invalid><RadioGroupItem value="plan" aria-label="Monthly" /></RadioGroupRoot>
    </div>
  )
}
