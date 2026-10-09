import { Input } from '../index.js'

/** The states a server can render; hover and focus-visible are live in the browser. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-3">
      <Input placeholder="Enter your email" aria-label="Idle" />
      <Input defaultValue="omar@example.com" aria-label="Filled" />
      <Input disabled defaultValue="omar@example.com" aria-label="Disabled" />
      <Input readOnly defaultValue="omar@example.com" aria-label="Read-only" />
      <Input invalid defaultValue="omar@example" aria-label="Invalid" />
      <Input required placeholder="Required" aria-label="Required" />
    </div>
  )
}
