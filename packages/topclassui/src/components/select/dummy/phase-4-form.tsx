import { Button } from '#components/button/index.js'
import { Checkbox } from '#components/checkbox/index.js'
import { NumberField } from '#components/number-field/index.js'
import { RadioGroupItem, RadioGroupRoot } from '#components/radio-group/index.js'
import { Slider } from '#components/slider/index.js'
import { Switch } from '#components/switch/index.js'
import { Select } from '../index.js'

const COUNTRIES = [{ value: 'jo', label: 'Jordan' }, { value: 'eg', label: 'Egypt' }, { value: 'ma', label: 'Morocco' }]

/** The second form of Phase 4: six controls in one plain form, each with a name and a default. Before any script runs
 * it sends the six defaults; after hydration what is on screen; after a reset the six defaults again. */
export default function Demo() {
  return (
    <form className="grid justify-items-start gap-4">
      <div className="flex items-center gap-2">
        <Checkbox id="phase-4-terms" name="terms" defaultChecked />
        <label htmlFor="phase-4-terms" className="text-sm text-body">I accept the terms</label>
      </div>
      <span id="phase-4-plan" className="text-sm text-body">Plan</span>
      <RadioGroupRoot aria-labelledby="phase-4-plan" name="plan" defaultValue="pro" orientation="horizontal">
        <RadioGroupItem value="free">Free</RadioGroupItem>
        <RadioGroupItem value="pro">Pro</RadioGroupItem>
        <RadioGroupItem value="team">Team</RadioGroupItem>
      </RadioGroupRoot>
      <div className="flex items-center gap-2">
        <Switch id="phase-4-digest" name="digest" defaultChecked />
        <label htmlFor="phase-4-digest" className="text-sm text-body">Weekly digest</label>
      </div>
      <label htmlFor="phase-4-country" className="text-sm text-body">Country</label>
      <Select id="phase-4-country" name="country" items={COUNTRIES} defaultValue="jo" />
      <span id="phase-4-volume" className="text-sm text-body">Volume</span>
      <Slider aria-labelledby="phase-4-volume" name="volume" defaultValue={60} step={5} />
      <label htmlFor="phase-4-guests" className="text-sm text-body">Guests</label>
      <NumberField id="phase-4-guests" name="guests" defaultValue={2} min={1} max={8} />
      <div className="flex gap-2">
        <Button type="submit">Save</Button>
        <Button type="reset" variant="outline">Reset</Button>
      </div>
    </form>
  )
}
