import { FileUpload } from '../index.js'

/** One cell per state, as the frame's strip: idle, invalid draws the zone's line in danger and thicker, disabled dims it. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      <div role="group" aria-label="Idle" className="grid gap-1.5">
        <label htmlFor="file-upload-idle" className="text-sm font-medium text-body">Idle</label>
        <FileUpload id="file-upload-idle" name="idle">Any file</FileUpload>
      </div>
      <div role="group" aria-label="Invalid" className="grid gap-1.5">
        <label htmlFor="file-upload-invalid" className="text-sm font-medium text-body">Invalid</label>
        <FileUpload id="file-upload-invalid" name="invalid" invalid>A file is required</FileUpload>
      </div>
      <div role="group" aria-label="Disabled" className="grid gap-1.5">
        <label htmlFor="file-upload-disabled" className="text-sm font-medium text-body">Disabled</label>
        <FileUpload id="file-upload-disabled" name="disabled" disabled>Uploads are closed</FileUpload>
      </div>
    </div>
  )
}
