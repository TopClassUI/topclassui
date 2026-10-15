import { Meter } from '../index.js'

export default function Demo() {
  return (
    <div className="grid max-w-sm gap-4">
      <Meter tone="primary" value={60} aria-label="Primary" />
      <Meter tone="neutral" value={60} aria-label="Neutral" />
      <Meter tone="success" value={60} aria-label="Success" />
      <Meter tone="warning" value={60} aria-label="Warning" />
      <Meter tone="danger" value={60} aria-label="Danger" />
      <Meter tone="info" value={60} aria-label="Info" />
    </div>
  )
}
