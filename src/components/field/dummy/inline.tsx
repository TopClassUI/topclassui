import { Checkbox } from '#components/checkbox/index.js'
import { Switch } from '#components/switch/index.js'
import { Field } from '../index.js'

/** inline: the box first and the label beside it, the hint and the error under the label. A click on a label toggles its box. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-4">
      <Field name="news" label="Send me product news" hint="About once a month" inline>
        {(control) => <Checkbox {...control} />}
      </Field>
      <Field name="digest" label="Weekly digest" error="Turn it on to get the summary" inline>
        {(control) => <Switch {...control} />}
      </Field>
    </div>
  )
}
