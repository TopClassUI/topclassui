import { Input } from '#components/input/index.js'
import { Textarea } from '#components/textarea/index.js'
import { Field } from '../index.js'

/** A hint, one error, and the array Zod's fieldErrors gives: the control reads the hint and then the errors. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-4">
      <Field name="username" label="Username" hint="Letters and numbers only" error="That name is taken">
        {(control) => <Input {...control} defaultValue="omar" autoComplete="username" fullWidth />}
      </Field>
      <Field name="bio" label="About you" hint="Shown on your profile" error={['Too short', 'Add at least one sentence']}>
        {(control) => <Textarea {...control} defaultValue="Hi" fullWidth />}
      </Field>
      <Field name="website" label="Website" hint="Optional">
        {(control) => <Input {...control} type="url" fullWidth />}
      </Field>
    </div>
  )
}
