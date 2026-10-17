import { Progress } from '../index.js'

/** custom emits no height, so the caller's own class sets it. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-4">
      <Progress value={40} aria-label="On the scale" />
      <Progress size="custom" value={40} className="h-3" aria-label="Your own height" />
    </div>
  )
}
