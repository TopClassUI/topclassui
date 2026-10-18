import { Button } from '#components/button/index.js'
import { Alert } from '../index.js'

/** Every state Alert draws: the three variants, the six tones, each slot left out, and actions. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <Alert variant="soft" title="Soft">A tint of the tone.</Alert>
      <Alert variant="solid" title="Solid">The full fill.</Alert>
      <Alert variant="outline" title="Outline">A line in the tone colour.</Alert>
      <Alert tone="primary" title="Primary">A new version is ready.</Alert>
      <Alert tone="neutral" title="Neutral">Nothing has changed since Monday.</Alert>
      <Alert tone="success" title="Success">The invoice was paid.</Alert>
      <Alert tone="warning" title="Warning">The trial ends in three days.</Alert>
      <Alert tone="danger" title="Danger">The last deploy failed.</Alert>
      <Alert tone="info" title="Info">Maintenance starts at 22:00.</Alert>
      <Alert title="Title only" />
      <Alert>Description only, with no title above it.</Alert>
      <Alert icon={null} title="No icon">The icon is left out.</Alert>
      <Alert
        tone="warning"
        title="With actions"
        actions={<Button size="sm" variant="outline" tone="warning">Remind me later</Button>}
      >
        Actions sit in a row under the description.
      </Alert>
    </div>
  )
}
