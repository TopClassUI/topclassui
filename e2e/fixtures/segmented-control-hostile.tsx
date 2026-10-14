// Loaded into a live page by e2e/segmented-control.spec.ts: what a careless caller hands a segmented control
// (unit-4.md, "Fixtures"). A 300-character word, a segment whose value is the empty string, an empty text, an element
// for a label, ten segments and sixty.
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { SegmentedControlItem, SegmentedControlRoot } from '#components/segmented-control/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
const WORD = 'Supercalifragilistic'.repeat(15)
const count = (length: number) => Array.from({ length }, (_, at) => String(at + 1))

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <form id="hostile" style={{ display: 'grid', gap: 24, padding: 16, alignContent: 'start' }}>
        <SegmentedControlRoot aria-label="A long word" name="word" defaultValue="long">
          <SegmentedControlItem value="long">{WORD}</SegmentedControlItem>
          <SegmentedControlItem value="short">Short</SegmentedControlItem>
        </SegmentedControlRoot>
        <SegmentedControlRoot aria-label="An empty value" name="empty" defaultValue="">
          <SegmentedControlItem value="">None</SegmentedControlItem>
          <SegmentedControlItem value="some">Some</SegmentedControlItem>
          <SegmentedControlItem value="blank" aria-label="Blank">{''}</SegmentedControlItem>
        </SegmentedControlRoot>
        <SegmentedControlRoot aria-label="An element" name="element" defaultValue="a">
          <SegmentedControlItem value="a"><strong>Bold <em>and</em> nested</strong></SegmentedControlItem>
          <SegmentedControlItem value="b">Plain</SegmentedControlItem>
        </SegmentedControlRoot>
        <SegmentedControlRoot aria-label="Ten" name="ten" defaultValue="1">
          {count(10).map((value) => <SegmentedControlItem key={value} value={value}>{`Segment ${value}`}</SegmentedControlItem>)}
        </SegmentedControlRoot>
        <SegmentedControlRoot aria-label="Sixty" name="sixty" defaultValue="1">
          {count(60).map((value) => <SegmentedControlItem key={value} value={value}>{`Option ${value}`}</SegmentedControlItem>)}
        </SegmentedControlRoot>
      </form>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
