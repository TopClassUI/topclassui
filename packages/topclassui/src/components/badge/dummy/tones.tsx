import { Badge } from '../index.js'

export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="solid" tone="primary">Primary</Badge>
        <Badge variant="solid" tone="neutral">Neutral</Badge>
        <Badge variant="solid" tone="success">Success</Badge>
        <Badge variant="solid" tone="warning">Warning</Badge>
        <Badge variant="solid" tone="danger">Danger</Badge>
        <Badge variant="solid" tone="info">Info</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="soft" tone="primary">Primary</Badge>
        <Badge variant="soft" tone="neutral">Neutral</Badge>
        <Badge variant="soft" tone="success">Success</Badge>
        <Badge variant="soft" tone="warning">Warning</Badge>
        <Badge variant="soft" tone="danger">Danger</Badge>
        <Badge variant="soft" tone="info">Info</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" tone="primary">Primary</Badge>
        <Badge variant="outline" tone="neutral">Neutral</Badge>
        <Badge variant="outline" tone="success">Success</Badge>
        <Badge variant="outline" tone="warning">Warning</Badge>
        <Badge variant="outline" tone="danger">Danger</Badge>
        <Badge variant="outline" tone="info">Info</Badge>
      </div>
    </div>
  )
}
