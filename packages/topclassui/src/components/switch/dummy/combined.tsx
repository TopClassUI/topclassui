import { Switch } from '../index.js'

/** The states a server can render, combined with on, the switches the keyboard and layout specs drive. A read-only switch looks like a live one: it says so to a screen reader only. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Switch aria-label="Off" />
      <Switch defaultChecked aria-label="On" />
      <Switch invalid aria-label="Invalid" />
      <Switch invalid defaultChecked aria-label="Invalid, on" />
      <Switch disabled aria-label="Disabled" />
      <Switch disabled defaultChecked aria-label="Disabled, on" />
      <Switch readOnly defaultChecked aria-label="Read-only" />
    </div>
  )
}
