import { Progress } from '../index.js'

/** A wait of unknown length: no value is announced, and a third of the track pulses. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-4">
      <Progress indeterminate aria-label="Loading the report" />
      <Progress indeterminate size="sm" tone="neutral" aria-label="Syncing" />
    </div>
  )
}
