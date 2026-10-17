import { FileUpload } from '../index.js'

/** The limits of the card's sample: up to five files, PDF or PNG, 5 MB each. maxFiles above 1 makes the input multiple. */
export default function Demo() {
  return (
    <div className="grid gap-1.5">
      <label htmlFor="file-upload-multiple" className="text-sm font-medium text-body">Attachments</label>
      <FileUpload id="file-upload-multiple" name="attachments" accept="application/pdf,image/png" maxFiles={5} maxSize={5 * 1024 * 1024}>
        PDF or PNG, up to 5 files
      </FileUpload>
    </div>
  )
}
