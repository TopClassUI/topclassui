import { Field } from '#components/field/index.js'
import { FileUpload } from '../index.js'

/** The card's sample: a Field names the input, and its hint describes it after the zone's own. */
export default function Demo() {
  return (
    <Field name="attachments" label="Attachments" hint="PDF or PNG, up to 5 files">
      {(control) => (
        <FileUpload {...control} accept="application/pdf,image/png" maxFiles={5} maxSize={5 * 1024 * 1024}>
          Drop them here, 5 MB each
        </FileUpload>
      )}
    </Field>
  )
}
