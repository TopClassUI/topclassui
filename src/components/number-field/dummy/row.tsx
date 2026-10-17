import { NumberField } from '../index.js'

/** Two side by side in a flex row: each shrinks to its share, as two Inputs would, and the page never scrolls. */
export default function Demo() {
  return (
    <div className="flex gap-2">
      <NumberField defaultValue={2} min={0} aria-label="Adults" />
      <NumberField defaultValue={0} min={0} aria-label="Children" />
    </div>
  )
}
