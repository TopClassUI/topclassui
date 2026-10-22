import { warningCircle } from '#icons/data/warning-circle.js'
import { Svg } from '#components/svg/index.js'
import { FileUpload } from '../index.js'

/** The frame's strip of mini zones, one a cell named by its aria-label: idle, drag over drawn at rest, a refused file's
 * row as the list shows it, and disabled. Uploading and done are not built; invalid has a demo of its own. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div role="group" aria-label="idle">
        <label htmlFor="file-upload-idle" className="sr-only">idle</label>
        <FileUpload id="file-upload-idle" name="idle" compact className="w-32" />
      </div>
      <div role="group" aria-label="drag over">
        <label htmlFor="file-upload-drag" className="sr-only">drag over</label>
        <FileUpload id="file-upload-drag" name="drag" compact data-dragging className="w-32" />
      </div>
      <div role="group" aria-label="error" className="flex w-32 items-center justify-center gap-1.5 text-xs text-muted">
        <span aria-hidden="true" className="flex text-danger-on-soft"><Svg icon={warningCircle} size="0.875rem" /></span>
        <span>Too large</span>
      </div>
      <div role="group" aria-label="disabled">
        <label htmlFor="file-upload-disabled" className="sr-only">disabled</label>
        <FileUpload id="file-upload-disabled" name="disabled" compact disabled className="w-32" />
      </div>
    </div>
  )
}
