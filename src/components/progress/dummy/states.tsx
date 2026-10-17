import { Progress } from '../index.js'

/** Every state Progress draws: empty, part way, complete, indeterminate, and the six tones. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-4">
      <div className="grid gap-1">
        <span id="progress-state-empty" className="text-sm">Empty</span>
        <Progress value={0} aria-labelledby="progress-state-empty" />
      </div>
      <div className="grid gap-1">
        <span id="progress-state-part" className="text-sm">Part way</span>
        <Progress value={40} aria-labelledby="progress-state-part" />
      </div>
      <div className="grid gap-1">
        <span id="progress-state-complete" className="text-sm">Complete</span>
        <Progress value={100} aria-labelledby="progress-state-complete" />
      </div>
      <div className="grid gap-1">
        <span id="progress-state-indeterminate" className="text-sm">Indeterminate</span>
        <Progress indeterminate aria-labelledby="progress-state-indeterminate" />
      </div>
      <div className="grid gap-1">
        <span id="progress-state-tones" className="text-sm">Tones</span>
        <div role="group" aria-labelledby="progress-state-tones" className="grid gap-2">
          <Progress tone="primary" value={60} aria-label="Primary" />
          <Progress tone="neutral" value={60} aria-label="Neutral" />
          <Progress tone="success" value={60} aria-label="Success" />
          <Progress tone="warning" value={60} aria-label="Warning" />
          <Progress tone="danger" value={60} aria-label="Danger" />
          <Progress tone="info" value={60} aria-label="Info" />
        </div>
      </div>
    </div>
  )
}
