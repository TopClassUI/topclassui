import { Checkbox } from '#components/checkbox/index.js'
import { Input } from '#components/input/index.js'
import { Field } from '../index.js'

/** The asterisk is only seen; the control says required itself: a native attribute, or aria-required on a Checkbox. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-4">
      <Field name="email" label="Email" hint="We never share it" required>
        {(control) => <Input {...control} type="email" autoComplete="email" fullWidth />}
      </Field>
      <Field name="terms" label="I accept the terms" required inline>
        {(control) => <Checkbox {...control} />}
      </Field>
    </div>
  )
}
