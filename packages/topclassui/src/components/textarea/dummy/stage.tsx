import { Textarea } from '../index.js'

/** The docs stage as the frame draws it: a filled field with its counter, no label. */
export default function Demo() {
  return <Textarea aria-label="Feedback" defaultValue="Tell us what you think about TopClass UI." showCount maxLength={500} />
}
