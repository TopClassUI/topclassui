import { Switch } from '../index.js'

/** Outside a Field: a native label points at the id of the switch, which is the button itself. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-3">
      <div className="flex items-center gap-2">
        <Switch id="switch-basic-digest" defaultChecked />
        <label htmlFor="switch-basic-digest" className="text-sm text-body">Weekly digest</label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="switch-basic-mentions" />
        <label htmlFor="switch-basic-mentions" className="text-sm text-body">Email me when I am mentioned</label>
      </div>
    </div>
  )
}
