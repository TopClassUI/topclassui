import { Button } from '#components/button/index.js'
import { Switch } from '../index.js'

/** One switch that is on, in a plain form: it sends digest=on, before any script runs and after. */
export default function Demo() {
  return (
    <form className="grid justify-items-start gap-3">
      <div className="flex items-center gap-2">
        <Switch id="switch-form-digest" name="digest" defaultChecked />
        <label htmlFor="switch-form-digest" className="text-sm text-body">Weekly digest</label>
      </div>
      <Button type="submit">Save</Button>
    </form>
  )
}
