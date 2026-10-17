import { Progress } from '../index.js'

/** The values the frame draws, from empty to complete, each named by the text above it. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-4">
      <div className="grid gap-1">
        <span id="step-empty" className="text-sm">Not started</span>
        <Progress value={0} aria-labelledby="step-empty" />
      </div>
      <div className="grid gap-1">
        <span id="step-early" className="text-sm">Uploading</span>
        <Progress value={15} aria-labelledby="step-early" />
      </div>
      <div className="grid gap-1">
        <span id="step-half" className="text-sm">Halfway</span>
        <Progress value={50} aria-labelledby="step-half" />
      </div>
      <div className="grid gap-1">
        <span id="step-late" className="text-sm">Almost there</span>
        <Progress value={85} aria-labelledby="step-late" />
      </div>
      <div className="grid gap-1">
        <span id="step-done" className="text-sm">Done</span>
        <Progress value={100} aria-labelledby="step-done" />
      </div>
    </div>
  )
}
