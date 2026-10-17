import { Checkbox } from '#components/checkbox/index.js'
import { Combobox } from '#components/combobox/index.js'
import { Input } from '#components/input/index.js'
import { NumberField } from '#components/number-field/index.js'
import { OTPField } from '#components/otp-field/index.js'
import { RadioGroupItem, RadioGroupRoot } from '#components/radio-group/index.js'
import { SegmentedControlItem, SegmentedControlRoot } from '#components/segmented-control/index.js'
import { Select } from '#components/select/index.js'
import { Slider } from '#components/slider/index.js'
import { Switch } from '#components/switch/index.js'
import { Textarea } from '#components/textarea/index.js'
import { Field } from '../index.js'

const COUNTRIES = [{ value: 'jo', label: 'Jordan' }, { value: 'eg', label: 'Egypt' }, { value: 'ma', label: 'Morocco' }]

/** The eleven controls, each spreading one control object as it is: each is named by the label, described by the hint
 * and then the error, and invalid, in the server HTML and once hydrated. */
export default function Demo() {
  return (
    <form className="grid max-w-sm gap-5">
      <Field name="email" label="Email" hint="Input hint" error="Input error" required>
        {(control) => <Input {...control} type="email" fullWidth />}
      </Field>
      <Field name="bio" label="Bio" hint="Textarea hint" error="Textarea error">
        {(control) => <Textarea {...control} fullWidth />}
      </Field>
      <Field name="terms" label="Terms" hint="Checkbox hint" error="Checkbox error" required inline>
        {(control) => <Checkbox {...control} />}
      </Field>
      <Field name="digest" label="Digest" hint="Switch hint" error="Switch error" inline>
        {(control) => <Switch {...control} />}
      </Field>
      <Field name="plan" label="Plan" hint="RadioGroup hint" error="RadioGroup error" required>
        {(control) => (
          <RadioGroupRoot {...control} orientation="horizontal">
            <RadioGroupItem value="free">Free</RadioGroupItem>
            <RadioGroupItem value="pro">Pro</RadioGroupItem>
          </RadioGroupRoot>
        )}
      </Field>
      <Field name="view" label="View" hint="SegmentedControl hint" error="SegmentedControl error">
        {(control) => (
          <SegmentedControlRoot {...control} defaultValue="board">
            <SegmentedControlItem value="board">Board</SegmentedControlItem>
            <SegmentedControlItem value="table">Table</SegmentedControlItem>
          </SegmentedControlRoot>
        )}
      </Field>
      <Field name="volume" label="Volume" hint="Slider hint" error="Slider error">
        {(control) => <Slider {...control} defaultValue={40} />}
      </Field>
      <Field name="guests" label="Guests" hint="NumberField hint" error="NumberField error">
        {(control) => <NumberField {...control} defaultValue={2} min={1} max={8} />}
      </Field>
      <Field name="code" label="Code" hint="OTPField hint" error="OTPField error">
        {(control) => <OTPField {...control} length={4} />}
      </Field>
      <Field name="country" label="Country" hint="Select hint" error="Select error" required>
        {(control) => <Select {...control} items={COUNTRIES} defaultValue="jo" />}
      </Field>
      <Field name="city" label="City" hint="Combobox hint" error="Combobox error">
        {(control) => <Combobox {...control} items={COUNTRIES} />}
      </Field>
    </form>
  )
}
