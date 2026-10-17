import { RadioGroupItem, RadioGroupRoot } from '#components/radio-group/index.js'
import { Field } from '../index.js'

/** A group no `<label for>` can name: the control object's aria-labelledby names it, and its hint describes it. */
export default function Demo() {
  return (
    <div className="grid max-w-sm">
      <Field name="plan" label="Plan" hint="You can change it later" required>
        {(control) => (
          <RadioGroupRoot {...control} defaultValue="pro">
            <RadioGroupItem value="free">Free</RadioGroupItem>
            <RadioGroupItem value="pro">Pro</RadioGroupItem>
            <RadioGroupItem value="team">Team</RadioGroupItem>
          </RadioGroupRoot>
        )}
      </Field>
    </div>
  )
}
