import { Progress } from '../index.js'

export default function Demo() {
  return (
    <div className="grid max-w-sm gap-4">
      <Progress tone="primary" value={60} aria-label="Primary" />
      <Progress tone="neutral" value={60} aria-label="Neutral" />
      <Progress tone="success" value={60} aria-label="Success" />
      <Progress tone="warning" value={60} aria-label="Warning" />
      <Progress tone="danger" value={60} aria-label="Danger" />
      <Progress tone="info" value={60} aria-label="Info" />
    </div>
  )
}
