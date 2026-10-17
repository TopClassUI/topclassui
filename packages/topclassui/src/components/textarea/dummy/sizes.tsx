import { Textarea } from '../index.js'

/** The five steps of the field scale: the padding and the type step change, the three rows stay. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-3">
      <Textarea size="xs" placeholder="Extra small" aria-label="Extra small" />
      <Textarea size="sm" placeholder="Small" aria-label="Small" />
      <Textarea placeholder="Medium" aria-label="Medium" />
      <Textarea size="lg" placeholder="Large" aria-label="Large" />
      <Textarea size="xl" placeholder="Extra large" aria-label="Extra large" />
    </div>
  )
}
