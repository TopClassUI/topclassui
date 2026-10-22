import { FileUpload } from '../index.js'

/** An upload the form refused: the zone's line turns danger and thicker, so the state is not told by colour alone. */
export default function Demo() {
  return (
    <div className="grid gap-1.5">
      <label htmlFor="file-upload-invalid" className="text-sm font-medium text-body">Contract</label>
      <FileUpload id="file-upload-invalid" name="contract" invalid>A signed PDF is required</FileUpload>
    </div>
  )
}
