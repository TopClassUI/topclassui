import { FileUpload } from '../index.js'

/** Images only, three at most: a pick of ten thousand text files refuses every one, and the list of ten thousand
 * refused rows windows, so only the rows in view are mounted. */
export default function Demo() {
  return (
    <div className="grid gap-1.5">
      <label htmlFor="file-upload-ten-thousand" className="text-sm font-medium text-body">Ten thousand files</label>
      <FileUpload id="file-upload-ten-thousand" name="photos" accept="image/*" maxFiles={3}>
        Images only, up to three
      </FileUpload>
    </div>
  )
}
