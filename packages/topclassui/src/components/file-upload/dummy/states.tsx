import { FileUpload } from '../index.js'

/** The frame's strip, one zone a cell named by its aria-label: idle, and disabled dimmed. Drag over, uploading, done and
 * error need a held file or a drag, which a server cannot draw; invalid has a demo of its own. */
export default function Demo() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(12rem,100%),1fr))] items-start gap-6">
      <div role="group" aria-label="idle">
        <label htmlFor="file-upload-idle" className="sr-only">idle</label>
        <FileUpload id="file-upload-idle" name="idle" />
      </div>
      <div role="group" aria-label="disabled">
        <label htmlFor="file-upload-disabled" className="sr-only">disabled</label>
        <FileUpload id="file-upload-disabled" name="disabled" disabled />
      </div>
    </div>
  )
}
