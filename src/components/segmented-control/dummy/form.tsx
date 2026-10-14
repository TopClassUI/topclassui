import { Button } from '#components/button/index.js'
import { SegmentedControlItem, SegmentedControlRoot } from '../index.js'

/** With a name the track is a form control: it sends view=table, before any script runs and after. */
export default function Demo() {
  return (
    <form className="grid justify-items-start gap-3">
      <span id="segmented-control-form-label" className="text-sm text-body">Default view</span>
      <SegmentedControlRoot aria-labelledby="segmented-control-form-label" name="view" defaultValue="table">
        <SegmentedControlItem value="board">Board</SegmentedControlItem>
        <SegmentedControlItem value="table">Table</SegmentedControlItem>
        <SegmentedControlItem value="calendar">Calendar</SegmentedControlItem>
      </SegmentedControlRoot>
      <Button type="submit">Save</Button>
    </form>
  )
}
