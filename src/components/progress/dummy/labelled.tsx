import { Progress } from '../index.js'

/** The docs sample: the visible text names the bar, and the bar announces 72. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-2">
      <span id="storage-label" className="text-sm">Storage: 7.2 GB of 10 GB</span>
      <Progress value={72} tone="warning" aria-labelledby="storage-label" />
    </div>
  )
}
