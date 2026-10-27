import { Button } from '#components/button/index.js'
import { Field } from '#components/field/index.js'
import { Input } from '#components/input/index.js'
import { Form } from '../index.js'

/** The subscribe form of "Your first component": it posts to the page it is on with no script, and the browser asks for the email first. */
export default function Demo() {
  return (
    <Form action="?subscribed" method="post" className="flex max-w-sm flex-col gap-4">
      <Field name="email" label="Email" hint="We never share it" required>
        {(control) => <Input {...control} type="email" autoComplete="email" fullWidth />}
      </Field>
      <Button type="submit">Subscribe</Button>
    </Form>
  )
}
