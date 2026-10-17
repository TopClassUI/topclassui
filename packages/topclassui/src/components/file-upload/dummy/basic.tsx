import { FileUpload } from '../index.js'

/** One file, named by its label. The hint inside the zone describes the input. */
export default function Demo() {
  return (
    <div className="grid gap-1.5">
      <label htmlFor="file-upload-basic" className="text-sm font-medium text-body">Attachment</label>
      <FileUpload id="file-upload-basic" name="attachment" accept=".png,.jpg,.jpeg,.pdf" maxSize={10 * 1024 * 1024}>
        PNG, JPG or PDF, up to 10 MB
      </FileUpload>
    </div>
  )
}
