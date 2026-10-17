import { Textarea } from '../index.js'

/** A label points at the id, and aria-describedby ties the hint on. No script is needed for any of it. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-1">
      <label htmlFor="textarea-basic-bio" className="text-sm font-medium text-body">About you</label>
      <Textarea
        id="textarea-basic-bio"
        name="bio"
        fullWidth
        placeholder="Write a short paragraph"
        aria-describedby="textarea-basic-hint"
      />
      <span id="textarea-basic-hint" className="text-xs text-muted">A short paragraph is enough</span>
    </div>
  )
}
