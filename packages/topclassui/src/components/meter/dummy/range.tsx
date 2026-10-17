import { Meter } from '../index.js'

/** A range of its own: 512 of 1024 GB fills half the track, and the value text says it in units. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-2">
      <span id="disk-label" className="text-sm">Disk: 512 GB of 1 TB</span>
      <Meter min={0} max={1024} value={512} aria-valuetext="512 GB of 1 TB" aria-labelledby="disk-label" />
    </div>
  )
}
