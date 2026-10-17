import { Checkbox } from '../index.js'

/** The states a server can render. A read-only checkbox looks like a live one: it says so to a screen reader only. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Checkbox aria-label="Unchecked" />
      <Checkbox defaultChecked aria-label="Checked" />
      <Checkbox indeterminate aria-label="Indeterminate" />
      <Checkbox invalid aria-label="Invalid" />
      <Checkbox invalid defaultChecked aria-label="Invalid, checked" />
      <Checkbox invalid indeterminate aria-label="Invalid, indeterminate" />
      <Checkbox disabled aria-label="Disabled" />
      <Checkbox disabled defaultChecked aria-label="Disabled, checked" />
      <Checkbox readOnly defaultChecked aria-label="Read-only" />
    </div>
  )
}
