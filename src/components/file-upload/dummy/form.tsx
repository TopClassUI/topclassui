import { Button } from '#components/button/index.js'
import { FileUpload } from '../index.js'

/** A multipart form that posts with no script: the input sends one part per file. An input cannot set the form's
 * encType, so the form writes it. Required: an empty input blocks the submit. */
export default function Demo() {
  return (
    <form method="post" encType="multipart/form-data" className="grid gap-3">
      <div className="grid gap-1.5">
        <label htmlFor="file-upload-form" className="text-sm font-medium text-body">Attachments</label>
        <FileUpload id="file-upload-form" name="attachments" maxFiles={5} required>Up to 5 files</FileUpload>
      </div>
      <div><Button type="submit">Send</Button></div>
    </form>
  )
}
