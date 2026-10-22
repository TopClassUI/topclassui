import { NumberField } from '../index.js'

/** The stage the frame draws: one bare field at 12, named by its aria-label. */
export default function Demo() {
  return <NumberField aria-label="Guests" defaultValue={12} />
}
