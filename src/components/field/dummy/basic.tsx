import { Input } from '#components/input/index.js'
import { Field } from '../index.js'

/** The label points at the input, and the input is named by it before any script runs. */
export default function Demo() {
  return (
    <div className="grid max-w-sm">
      <Field name="email" label="Email">
        {(control) => <Input {...control} type="email" autoComplete="email" fullWidth />}
      </Field>
    </div>
  )
}
