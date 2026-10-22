import { SegmentedControlItem, SegmentedControlRoot } from '../index.js'

/** The ring a focused segment wears, drawn at rest so the strip can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = 'not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:-outline-offset-(length:--tc-ring-width) not-forced-colors:outline-ring'

/** One small track per state, named by its aria-label: the five Figma 138:668 draws. A track always has a selected segment,
 * so hover is drawn identical to idle; invalid, one disabled segment and read-only are in track-states. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <SegmentedControlRoot size="sm" aria-label="idle" defaultValue="a">
        <SegmentedControlItem value="a">A</SegmentedControlItem>
        <SegmentedControlItem value="b">B</SegmentedControlItem>
      </SegmentedControlRoot>
      <SegmentedControlRoot size="sm" aria-label="hover" defaultValue="a">
        <SegmentedControlItem value="a">A</SegmentedControlItem>
        <SegmentedControlItem value="b">B</SegmentedControlItem>
      </SegmentedControlRoot>
      <SegmentedControlRoot size="sm" aria-label="focus-visible" defaultValue="a">
        <SegmentedControlItem value="a" className={RING}>A</SegmentedControlItem>
        <SegmentedControlItem value="b">B</SegmentedControlItem>
      </SegmentedControlRoot>
      <SegmentedControlRoot size="sm" aria-label="checked" defaultValue="a">
        <SegmentedControlItem value="a">A</SegmentedControlItem>
        <SegmentedControlItem value="b">B</SegmentedControlItem>
      </SegmentedControlRoot>
      <SegmentedControlRoot size="sm" aria-label="disabled" disabled defaultValue="a">
        <SegmentedControlItem value="a">A</SegmentedControlItem>
        <SegmentedControlItem value="b">B</SegmentedControlItem>
      </SegmentedControlRoot>
    </div>
  )
}
