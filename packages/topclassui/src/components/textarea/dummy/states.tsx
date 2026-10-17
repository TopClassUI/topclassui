import { Textarea } from '../index.js'

/** The states a server can render; hover and focus-visible are live in the browser. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-3">
      <Textarea fullWidth placeholder="Write your message" aria-label="Idle" />
      <Textarea fullWidth defaultValue="Tell us what you think about TopClass UI." aria-label="Filled" />
      <Textarea fullWidth invalid defaultValue="Too short" aria-label="Invalid" />
      <Textarea fullWidth disabled defaultValue="Sent on Monday" aria-label="Disabled" />
      <Textarea fullWidth readOnly defaultValue="Kept as it was sent" aria-label="Read-only" />
      <Textarea fullWidth required placeholder="Required" aria-label="Required" />
    </div>
  )
}
