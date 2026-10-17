import { SegmentedControlItem, SegmentedControlRoot } from '../index.js'

/** A view switch: no name and no form, one segment always selected. The track is named by aria-label, and each
 * segment by its own text. */
export default function Demo() {
  return (
    <SegmentedControlRoot aria-label="View" defaultValue="board">
      <SegmentedControlItem value="board">Board</SegmentedControlItem>
      <SegmentedControlItem value="table">Table</SegmentedControlItem>
      <SegmentedControlItem value="calendar">Calendar</SegmentedControlItem>
    </SegmentedControlRoot>
  )
}
