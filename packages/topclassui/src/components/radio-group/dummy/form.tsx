import { Button } from '#components/button/index.js'
import { RadioGroupItem, RadioGroupRoot } from '../index.js'

/** The group carries the name and the default; each radio only its value and its text. It sends plan=pro, before any
 * script runs and after. */
export default function Demo() {
  return (
    <form className="grid justify-items-start gap-3">
      <span id="radio-group-form-label" className="text-sm text-body">Plan</span>
      <RadioGroupRoot aria-labelledby="radio-group-form-label" name="plan" defaultValue="pro">
        <RadioGroupItem value="free">Free</RadioGroupItem>
        <RadioGroupItem value="pro">Pro</RadioGroupItem>
        <RadioGroupItem value="team">Team</RadioGroupItem>
      </RadioGroupRoot>
      <Button type="submit">Save</Button>
    </form>
  )
}
