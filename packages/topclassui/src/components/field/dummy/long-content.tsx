import { Checkbox } from '#components/checkbox/index.js'
import { Input } from '#components/input/index.js'
import { Field } from '../index.js'

const WORD = 'x'.repeat(300)
const SENTENCE = 'A label long enough to wrap onto several lines on any phone, '.repeat(5)

/** Hostile text: a 300-character word in the label, the hint and the error, and a long sentence beside a box. It wraps; nothing scrolls. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-4">
      <Field name="word" label={WORD} hint={WORD} error={WORD} required>
        {(control) => <Input {...control} fullWidth />}
      </Field>
      <Field name="sentence" label={SENTENCE} hint={WORD} inline>
        {(control) => <Checkbox {...control} />}
      </Field>
    </div>
  )
}
