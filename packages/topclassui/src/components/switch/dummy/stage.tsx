import { Switch } from '../index.js'

/** The stage the frame draws: one switch off and one on, bare, each named by its aria-label. */
export default function Demo() {
  return (
    <div className="flex items-center gap-4">
      <Switch aria-label="Off" />
      <Switch defaultChecked aria-label="On" />
    </div>
  )
}
