import { FileUpload } from '../index.js'
import type { FileUploadDesignProps } from '../types.js'

/** The site's Try it stage: each schema prop arrives from a control, and an absent one keeps its default. Five files of
 * up to 10 MB, as the frame draws it; the zone is named for a reader, with no visible label. */
export default function Demo({ maxFiles = 5, ...props }: FileUploadDesignProps = {}) {
  return (
    <FileUpload
      aria-label="Attachment"
      name="attachment"
      accept=".png,.jpg,.jpeg,.pdf"
      maxSize={10 * 1024 * 1024}
      maxFiles={maxFiles}
      className="w-80 max-w-full"
      {...props}
    >
      PNG, JPG or PDF, up to 10 MB
    </FileUpload>
  )
}
