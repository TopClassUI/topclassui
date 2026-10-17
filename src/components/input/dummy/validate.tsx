import { Button } from '#components/button/index.js'
import { Input } from '../index.js'

/** With validate, a value pasted past a removed maxlength or written by script is held to the same rules, and the
 * form is not sent until it is back inside them. */
export default function Demo() {
  return (
    <form className="grid max-w-sm justify-items-start gap-2">
      <label htmlFor="input-validate-handle" className="text-sm font-medium text-body">Handle</label>
      <Input id="input-validate-handle" name="handle" maxLength={12} fullWidth validate />
      <label htmlFor="input-validate-postcode" className="text-sm font-medium text-body">Postcode</label>
      <Input id="input-validate-postcode" name="postcode" inputMode="numeric" pattern="[0-9]{5}" fullWidth validate />
      <label htmlFor="input-validate-guests" className="text-sm font-medium text-body">Guests</label>
      <Input id="input-validate-guests" name="guests" type="number" min={1} max={8} defaultValue={2} fullWidth validate />
      <Button type="submit">Send</Button>
    </form>
  )
}
