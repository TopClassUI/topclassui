import { Textarea } from '../index.js'

/** A read-only field takes the focus and the ring but no key: its text can be read and selected, never changed. */
export default function Demo() {
  return <Textarea readOnly defaultValue="Kept as it was sent" aria-label="Read-only" />
}
