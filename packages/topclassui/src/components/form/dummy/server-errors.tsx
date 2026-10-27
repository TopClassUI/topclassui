import { Button } from '#components/button/index.js'
import { Field } from '#components/field/index.js'
import { Input } from '#components/input/index.js'
import { Textarea } from '#components/textarea/index.js'
import { Form } from '../index.js'

/** What an action answered, as a server page hands it back: each message keyed by name, and what was sent. */
const ANSWER = {
  errors: { email: 'This email is already subscribed', message: ['Write at least 20 characters', 'Leave out the links'] },
  values: { email: 'taken@example.com', message: 'Hi, see example.com' },
}

/** Server Fields given the errors an action returned: each lands on its own field, and the values come back as defaults. */
export default function Demo() {
  return (
    <Form action="?sent" method="post" className="flex max-w-sm flex-col gap-4">
      <Field name="email" label="Email" error={ANSWER.errors.email} required>
        {(control) => <Input {...control} type="email" autoComplete="email" defaultValue={ANSWER.values.email} fullWidth />}
      </Field>
      <Field name="message" label="Message" hint="What can we help with?" error={ANSWER.errors.message}>
        {(control) => <Textarea {...control} defaultValue={ANSWER.values.message} fullWidth />}
      </Field>
      <Button type="submit">Send</Button>
    </Form>
  )
}
