import { SegmentedControlItem, SegmentedControlRoot } from '../index.js'

/** A segment holds one line: a label wider than the track ends in an ellipsis, and the full text stays its name. */
export default function Demo() {
  return (
    <SegmentedControlRoot aria-label="Files" defaultValue="recent">
      <SegmentedControlItem value="recent">Recently opened by anyone in this workspace</SegmentedControlItem>
      <SegmentedControlItem value="starred">Starred</SegmentedControlItem>
      <SegmentedControlItem value="shared">Shared with me</SegmentedControlItem>
    </SegmentedControlRoot>
  )
}
