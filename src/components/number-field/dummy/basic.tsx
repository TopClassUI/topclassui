import { NumberField } from '../index.js'

/** Outside a Field: a native label points at the id, which Base UI gives to the visible input. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-2">
      <label htmlFor="number-field-basic-guests" className="text-sm text-body">Guests</label>
      <NumberField id="number-field-basic-guests" defaultValue={2} min={1} max={8} />
    </div>
  )
}
