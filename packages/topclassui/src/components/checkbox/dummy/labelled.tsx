import { Checkbox } from '../index.js'

/** The two native ways to name a box: a label that points at its id, and a label that wraps it. A click on either presses it. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox-labelled-for" />
        <label htmlFor="checkbox-labelled-for" className="text-sm text-body">Named by a label that points at it</label>
      </div>
      <label className="flex items-center gap-2 text-sm text-body">
        <Checkbox id="checkbox-labelled-wrap" />
        Named by a label that wraps it
      </label>
    </div>
  )
}
