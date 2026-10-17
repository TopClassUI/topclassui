import { Button } from '#components/button/index.js'
import { Checkbox } from '#components/checkbox/index.js'
import { Input } from '#components/input/index.js'
import { Textarea } from '#components/textarea/index.js'
import { Field } from '../index.js'

/** A plain form: Field adds nothing it sends, the controls do, before any script runs and after. */
export default function Demo() {
  return (
    <form className="grid max-w-sm gap-4">
      <Field name="email" label="Email" hint="We never share it" required>
        {(control) => <Input {...control} type="email" defaultValue="omar@example.com" autoComplete="email" fullWidth />}
      </Field>
      <Field name="message" label="Message">
        {(control) => <Textarea {...control} defaultValue="Hello" fullWidth />}
      </Field>
      <Field name="terms" label="I accept the terms" inline>
        {(control) => <Checkbox {...control} defaultChecked />}
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button type="submit">Send</Button>
        <Button type="reset" variant="outline">Clear</Button>
      </div>
    </form>
  )
}
