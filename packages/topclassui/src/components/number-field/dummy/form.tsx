import { Button } from '#components/button/index.js'
import { NumberField } from '../index.js'

/** One field in a plain form: it sends guests=2, before any script runs and after. */
export default function Demo() {
  return (
    <form className="grid justify-items-start gap-2">
      <label htmlFor="number-field-form-guests" className="text-sm text-body">Guests</label>
      <NumberField id="number-field-form-guests" name="guests" defaultValue={2} min={1} max={8} />
      <Button type="submit">Book</Button>
    </form>
  )
}
