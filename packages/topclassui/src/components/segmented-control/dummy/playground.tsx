import { SegmentedControlItem, SegmentedControlRoot } from '../index.js'
import type { SegmentedControlDesignProps } from '../types.js'

/** The site's Try it stage: every prop of the schema, passed straight through to the track. */
export default function Demo(props: SegmentedControlDesignProps) {
  return (
    <SegmentedControlRoot {...props} aria-label="View" defaultValue="board">
      <SegmentedControlItem value="board">Board</SegmentedControlItem>
      <SegmentedControlItem value="table">Table</SegmentedControlItem>
      <SegmentedControlItem value="calendar">Calendar</SegmentedControlItem>
    </SegmentedControlRoot>
  )
}
