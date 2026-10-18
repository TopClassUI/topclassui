import { FileUpload } from '../index.js'
import type { FileUploadDesignProps } from '../types.js'

/** The site's Try it stage: each schema prop arrives from a control, and an absent one keeps its default. */
export default function Demo(props: FileUploadDesignProps) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor="file-upload-playground" className="text-sm font-medium text-body">Attachment</label>
      <FileUpload id="file-upload-playground" name="attachment" accept=".png,.jpg,.jpeg,.pdf" {...props}>
        PNG, JPG or PDF
      </FileUpload>
    </div>
  )
}
