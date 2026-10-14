import { Textarea } from '../index.js'

/** The count against the cap: always with showCount, from nine tenths of it with autosize alone, never with no cap. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-3">
      <Textarea fullWidth showCount maxLength={60} defaultValue="Twelve chars" aria-label="Always counted" />
      <Textarea fullWidth autosize maxLength={60} aria-label="Counted near the cap" />
      <Textarea fullWidth showCount maxLength={12} defaultValue="Twelve chars" aria-label="At the cap" />
      <Textarea fullWidth showCount maxLength={null} aria-label="No cap" />
    </div>
  )
}
