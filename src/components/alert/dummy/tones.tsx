import { Alert } from '../index.js'

/** Every tone in every variant, so axe measures all eighteen cells in each mode. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Alert variant="soft" tone="primary" title="Primary">A new version is ready.</Alert>
        <Alert variant="soft" tone="neutral" title="Neutral">Nothing has changed since Monday.</Alert>
        <Alert variant="soft" tone="success" title="Success">The invoice was paid.</Alert>
        <Alert variant="soft" tone="warning" title="Warning">The trial ends in three days.</Alert>
        <Alert variant="soft" tone="danger" title="Danger">The last deploy failed.</Alert>
        <Alert variant="soft" tone="info" title="Info">Maintenance starts at 22:00.</Alert>
      </div>
      <div className="flex flex-col gap-3">
        <Alert variant="solid" tone="primary" title="Primary">A new version is ready.</Alert>
        <Alert variant="solid" tone="neutral" title="Neutral">Nothing has changed since Monday.</Alert>
        <Alert variant="solid" tone="success" title="Success">The invoice was paid.</Alert>
        <Alert variant="solid" tone="warning" title="Warning">The trial ends in three days.</Alert>
        <Alert variant="solid" tone="danger" title="Danger">The last deploy failed.</Alert>
        <Alert variant="solid" tone="info" title="Info">Maintenance starts at 22:00.</Alert>
      </div>
      <div className="flex flex-col gap-3">
        <Alert variant="outline" tone="primary" title="Primary">A new version is ready.</Alert>
        <Alert variant="outline" tone="neutral" title="Neutral">Nothing has changed since Monday.</Alert>
        <Alert variant="outline" tone="success" title="Success">The invoice was paid.</Alert>
        <Alert variant="outline" tone="warning" title="Warning">The trial ends in three days.</Alert>
        <Alert variant="outline" tone="danger" title="Danger">The last deploy failed.</Alert>
        <Alert variant="outline" tone="info" title="Info">Maintenance starts at 22:00.</Alert>
      </div>
    </div>
  )
}
