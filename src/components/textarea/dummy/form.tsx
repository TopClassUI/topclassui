import { Button } from '#components/button/index.js'
import { Textarea } from '../index.js'

/** A plain form: the textarea sends what is typed before any script runs, and a reset needs none either. */
export default function Demo() {
  return (
    <form className="grid max-w-sm justify-items-start gap-3">
      <label htmlFor="textarea-form-message" className="text-sm font-medium text-body">Message</label>
      <Textarea id="textarea-form-message" name="message" fullWidth defaultValue="Hello" required />
      <label htmlFor="textarea-form-notes" className="text-sm font-medium text-body">Notes</label>
      <Textarea id="textarea-form-notes" name="notes" fullWidth autosize showCount />
      <div className="flex gap-2">
        <Button type="submit">Send</Button>
        <Button type="reset" variant="outline">Clear</Button>
      </div>
    </form>
  )
}
