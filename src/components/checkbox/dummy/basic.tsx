import { Checkbox } from '../index.js'

/** Outside a Field: a native label points at the id of the checkbox, which is the button itself. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox-basic-terms" defaultChecked />
        <label htmlFor="checkbox-basic-terms" className="text-sm text-body">I accept the terms</label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox-basic-news" />
        <label htmlFor="checkbox-basic-news" className="text-sm text-body">Send me product news</label>
      </div>
    </div>
  )
}
