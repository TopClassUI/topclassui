import { Tag } from '../index.js'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tag tone="primary">Primary</Tag>
      <Tag tone="neutral">Neutral</Tag>
      <Tag tone="success">Success</Tag>
      <Tag tone="warning">Warning</Tag>
      <Tag tone="danger">Danger</Tag>
      <Tag tone="info">Info</Tag>
    </div>
  )
}
