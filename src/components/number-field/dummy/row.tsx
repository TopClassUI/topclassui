import { NumberField } from '../index.js'

/** Two side by side: each shrinks to its share, as two Inputs would, and the page never scrolls. Under 6.5rem each, as at
 * 200% text on a phone, the second goes under the first, so neither has a stepper cut. */
export default function Demo() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,6.5rem),max-content))] gap-2">
      <NumberField defaultValue={2} min={0} aria-label="Adults" />
      <NumberField defaultValue={0} min={0} aria-label="Children" />
    </div>
  )
}
