import { FileUpload } from '../index.js'

/** Invalid draws the zone's line in danger and thicker; disabled dims the zone and takes no file. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-1.5">
        <label htmlFor="file-upload-invalid" className="text-sm font-medium text-body">Invalid</label>
        <FileUpload id="file-upload-invalid" name="invalid" invalid>A file is required</FileUpload>
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="file-upload-disabled" className="text-sm font-medium text-body">Disabled</label>
        <FileUpload id="file-upload-disabled" name="disabled" disabled>Uploads are closed</FileUpload>
      </div>
    </div>
  )
}
