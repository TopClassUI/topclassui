import { SegmentedControlItem, SegmentedControlRoot } from '../index.js'

/** fullWidth: the track fills its parent and the segments share it equally. For a few short segments. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-2">
      <span id="segmented-control-full-label" className="text-sm text-body">Range</span>
      <SegmentedControlRoot aria-labelledby="segmented-control-full-label" fullWidth defaultValue="week">
        <SegmentedControlItem value="day">Day</SegmentedControlItem>
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
        <SegmentedControlItem value="month">Month</SegmentedControlItem>
      </SegmentedControlRoot>
    </div>
  )
}
