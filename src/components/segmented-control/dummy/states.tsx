import { SegmentedControlItem, SegmentedControlRoot } from '../index.js'

/** The states a server can render. A read-only track looks like a live one: it says so to a screen reader only. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-4">
      <SegmentedControlRoot aria-label="Invalid" invalid defaultValue="yes">
        <SegmentedControlItem value="yes">Invalid, selected</SegmentedControlItem>
        <SegmentedControlItem value="no">Invalid</SegmentedControlItem>
      </SegmentedControlRoot>
      <SegmentedControlRoot aria-label="Disabled" disabled defaultValue="yes">
        <SegmentedControlItem value="yes">Disabled, selected</SegmentedControlItem>
        <SegmentedControlItem value="no">Disabled</SegmentedControlItem>
      </SegmentedControlRoot>
      <SegmentedControlRoot aria-label="One disabled" defaultValue="yes">
        <SegmentedControlItem value="yes">Live, selected</SegmentedControlItem>
        <SegmentedControlItem value="no" disabled>One disabled</SegmentedControlItem>
        <SegmentedControlItem value="maybe">Live</SegmentedControlItem>
      </SegmentedControlRoot>
      <SegmentedControlRoot aria-label="Read-only" readOnly defaultValue="yes">
        <SegmentedControlItem value="yes">Read-only, selected</SegmentedControlItem>
        <SegmentedControlItem value="no">Read-only</SegmentedControlItem>
      </SegmentedControlRoot>
    </div>
  )
}
