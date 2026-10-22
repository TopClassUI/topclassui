import { NumberField } from '../index.js'

/** The line a field wears under the pointer and the ring it wears on focus-visible, drawn at rest on its box so the strip can show them; not under forced colours, where a ring at rest would read as focus. */
const HOVER = '*:border-body'
const RING = 'not-forced-colors:*:outline-solid not-forced-colors:*:outline-(length:--tc-ring-width) not-forced-colors:*:outline-offset-(length:--tc-ring-offset) not-forced-colors:*:outline-ring'

/** One cell per state the strip draws, named by its aria-label, each field narrow enough for its cell; at the limit
 * dims +. Empty and read-only are in the combined demo. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <NumberField defaultValue={12} aria-label="idle" className="w-30" />
      <NumberField defaultValue={12} aria-label="hover" className={`w-30 ${HOVER}`} />
      <NumberField defaultValue={12} aria-label="focus-visible" className={`w-30 ${RING}`} />
      <NumberField max={99} defaultValue={99} aria-label="at-limit" className="w-30" />
      <NumberField invalid defaultValue={12} aria-label="invalid" className="w-30" />
      <NumberField disabled defaultValue={12} aria-label="disabled" className="w-30" />
    </div>
  )
}
