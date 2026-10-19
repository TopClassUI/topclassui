import { SegmentedControlItem, SegmentedControlRoot } from '../index.js'

/** The ring a focused segment wears, drawn at rest so the strip can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = 'not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:-outline-offset-(length:--tc-ring-width) not-forced-colors:outline-ring'

/** One track per state, named by its aria-label: the five Figma 138:668 draws, then invalid, one disabled segment and
 * read-only. A track always has a selected segment, so hover is drawn identical to idle. A read-only track looks like a live one. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <SegmentedControlRoot aria-label="idle" defaultValue="a">
        <SegmentedControlItem value="a">A</SegmentedControlItem>
        <SegmentedControlItem value="b">B</SegmentedControlItem>
      </SegmentedControlRoot>
      <SegmentedControlRoot aria-label="hover" defaultValue="a">
        <SegmentedControlItem value="a">A</SegmentedControlItem>
        <SegmentedControlItem value="b">B</SegmentedControlItem>
      </SegmentedControlRoot>
      <SegmentedControlRoot aria-label="focus-visible" defaultValue="a">
        <SegmentedControlItem value="a" className={RING}>A</SegmentedControlItem>
        <SegmentedControlItem value="b">B</SegmentedControlItem>
      </SegmentedControlRoot>
      <SegmentedControlRoot aria-label="checked" defaultValue="a">
        <SegmentedControlItem value="a">A</SegmentedControlItem>
        <SegmentedControlItem value="b">B</SegmentedControlItem>
      </SegmentedControlRoot>
      <SegmentedControlRoot aria-label="disabled" disabled defaultValue="a">
        <SegmentedControlItem value="a">A</SegmentedControlItem>
        <SegmentedControlItem value="b">B</SegmentedControlItem>
      </SegmentedControlRoot>
      <SegmentedControlRoot aria-label="invalid" invalid defaultValue="a">
        <SegmentedControlItem value="a">A</SegmentedControlItem>
        <SegmentedControlItem value="b">B</SegmentedControlItem>
      </SegmentedControlRoot>
      <SegmentedControlRoot aria-label="one disabled" defaultValue="a">
        <SegmentedControlItem value="a">A</SegmentedControlItem>
        <SegmentedControlItem value="b" disabled>B</SegmentedControlItem>
        <SegmentedControlItem value="c">C</SegmentedControlItem>
      </SegmentedControlRoot>
      <SegmentedControlRoot aria-label="read-only" readOnly defaultValue="a">
        <SegmentedControlItem value="a">A</SegmentedControlItem>
        <SegmentedControlItem value="b">B</SegmentedControlItem>
      </SegmentedControlRoot>
    </div>
  )
}
