import { Input } from '../index.js'

/** The states a server can render; hover and focus-visible are live in the browser. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-3">
      <Input fullWidth placeholder="Enter your email" aria-label="Idle" />
      <Input fullWidth defaultValue="omar@example.com" aria-label="Filled" />
      <Input fullWidth disabled defaultValue="omar@example.com" aria-label="Disabled" />
      <Input fullWidth readOnly defaultValue="omar@example.com" aria-label="Read-only" />
      <Input fullWidth invalid defaultValue="omar@example" aria-label="Invalid" />
      <Input fullWidth required placeholder="Required" aria-label="Required" />
    </div>
  )
}
