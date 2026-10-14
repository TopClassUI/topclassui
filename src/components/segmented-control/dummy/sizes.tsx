import { SegmentedControlItem, SegmentedControlRoot } from '../index.js'

/** The five sizes, one track each, the first segment selected. A segment is never under 24 px, 44 under a finger. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-4">
      <SegmentedControlRoot size="xs" aria-label="Extra small" defaultValue="on">
        <SegmentedControlItem value="on">Extra small</SegmentedControlItem>
        <SegmentedControlItem value="off">Off</SegmentedControlItem>
      </SegmentedControlRoot>
      <SegmentedControlRoot size="sm" aria-label="Small" defaultValue="on">
        <SegmentedControlItem value="on">Small</SegmentedControlItem>
        <SegmentedControlItem value="off">Off</SegmentedControlItem>
      </SegmentedControlRoot>
      <SegmentedControlRoot size="md" aria-label="Medium" defaultValue="on">
        <SegmentedControlItem value="on">Medium</SegmentedControlItem>
        <SegmentedControlItem value="off">Off</SegmentedControlItem>
      </SegmentedControlRoot>
      <SegmentedControlRoot size="lg" aria-label="Large" defaultValue="on">
        <SegmentedControlItem value="on">Large</SegmentedControlItem>
        <SegmentedControlItem value="off">Off</SegmentedControlItem>
      </SegmentedControlRoot>
      <SegmentedControlRoot size="xl" aria-label="Extra large" defaultValue="on">
        <SegmentedControlItem value="on">Extra large</SegmentedControlItem>
        <SegmentedControlItem value="off">Off</SegmentedControlItem>
      </SegmentedControlRoot>
    </div>
  )
}
