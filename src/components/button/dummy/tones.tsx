import { Button } from '../index.js'

export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button tone="primary">Primary</Button>
        <Button tone="neutral">Neutral</Button>
        <Button tone="success">Success</Button>
        <Button tone="warning">Warning</Button>
        <Button tone="danger">Danger</Button>
        <Button tone="info">Info</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="soft" tone="primary">Primary</Button>
        <Button variant="soft" tone="neutral">Neutral</Button>
        <Button variant="soft" tone="success">Success</Button>
        <Button variant="soft" tone="warning">Warning</Button>
        <Button variant="soft" tone="danger">Danger</Button>
        <Button variant="soft" tone="info">Info</Button>
      </div>
    </div>
  )
}
