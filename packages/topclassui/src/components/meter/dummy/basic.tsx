import { Meter } from '../index.js'

/** The docs sample: the visible text names the meter, which reads 60 of 0 to 100. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-2">
      <span id="battery-label" className="text-sm">Battery</span>
      <Meter value={60} aria-labelledby="battery-label" />
    </div>
  )
}
