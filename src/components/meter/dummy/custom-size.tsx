import { Meter } from '../index.js'

/** custom emits no height, so the caller's own class sets it. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-4">
      <Meter value={40} aria-label="On the scale" />
      <Meter size="custom" value={40} className="h-3" aria-label="Your own height" />
    </div>
  )
}
