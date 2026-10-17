import { SegmentedControlItem, SegmentedControlRoot, SegmentedControlSkeleton } from '../index.js'

const PAIRS = [
  { pair: 'xs', size: 'xs', fullWidth: false },
  { pair: 'sm', size: 'sm', fullWidth: false },
  { pair: 'md', size: 'md', fullWidth: false },
  { pair: 'lg', size: 'lg', fullWidth: false },
  { pair: 'xl', size: 'xl', fullWidth: false },
  { pair: 'full', size: 'md', fullWidth: true },
] as const

/** Each track above the skeleton that holds its place, in a wrapper each: the same height, and with fullWidth the same width. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      {PAIRS.map(({ pair, size, fullWidth }) => (
        <div key={pair} data-pair={pair} className="grid gap-2">
          <div>
            <SegmentedControlRoot size={size} fullWidth={fullWidth} aria-label={`Range, ${pair}`} defaultValue="day">
              <SegmentedControlItem value="day">Day</SegmentedControlItem>
              <SegmentedControlItem value="week">Week</SegmentedControlItem>
              <SegmentedControlItem value="month">Month</SegmentedControlItem>
            </SegmentedControlRoot>
          </div>
          <div><SegmentedControlSkeleton size={size} fullWidth={fullWidth} items={3} /></div>
        </div>
      ))}
    </div>
  )
}
