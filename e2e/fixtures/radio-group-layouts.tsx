// Loaded into a live page by e2e/radio-group.spec.ts: a radio group where a real page puts one. Alone as a grid item,
// in a wrapper in a grid track, in a flex-1 column, in a w-fit parent, in a table cell, in a label row inside a column
// that aligns to the start, with a 300-character text, as a row that wraps, and with an element for its text. Inline
// styles: the harness compiles only src/.
import type { CSSProperties, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { RadioGroupItem, RadioGroupRoot } from '#components/radio-group/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

const PAGE: CSSProperties = { display: 'grid', gap: 24, padding: 16, alignContent: 'start' }
const CELL: CSSProperties = { border: '1px solid GrayText', padding: 8 }
const LONG = 'Notifications'.repeat(24).slice(0, 300)

/** A group of two, the first checked, named by the case. */
function Pair({ name, first = 'First', size }: { name: string, first?: ReactNode, size?: 'sm' }) {
  return (
    <RadioGroupRoot aria-label={name} defaultValue="a" size={size}>
      <RadioGroupItem value="a">{first}</RadioGroupItem>
      <RadioGroupItem value="b">Second</RadioGroupItem>
    </RadioGroupRoot>
  )
}

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div id="layouts" style={PAGE}>
        <div id="grid" data-case="grid" style={{ display: 'grid' }}><Pair name="In a grid" /></div>
        <div data-case="track" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div><Pair name="In a wrapper in a grid track" /></div>
          <span>Beside</span>
        </div>
        <div data-case="flex-1" style={{ display: 'flex', gap: 8 }}>
          <span style={{ width: 80, flex: 'none' }}>Side</span>
          <div style={{ flex: 1, minWidth: 0 }}><Pair name="In a flex-1 column" /></div>
        </div>
        <div data-case="w-fit" style={{ width: 'fit-content' }}><Pair name="In a w-fit parent" /></div>
        <table data-case="cell" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            <tr>
              <td style={CELL}>Plan</td>
              <td style={CELL}><Pair name="In a table cell" /></td>
            </tr>
          </tbody>
        </table>
        <div data-case="label-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span id="layouts-row">In a label row</span>
            <RadioGroupRoot aria-labelledby="layouts-row" defaultValue="a" orientation="horizontal">
              <RadioGroupItem value="a">Yes</RadioGroupItem>
              <RadioGroupItem value="b">No</RadioGroupItem>
            </RadioGroupRoot>
          </div>
        </div>
        <div data-case="long" style={{ display: 'flex', minWidth: 0 }}><Pair name="With a long text" first={LONG} size="sm" /></div>
        <div data-case="horizontal">
          <RadioGroupRoot aria-label="A row that wraps" defaultValue="a" orientation="horizontal">
            {['a', 'b', 'c', 'd', 'e', 'f'].map((value) => <RadioGroupItem key={value} value={value}>{`Option ${value.toUpperCase()}`}</RadioGroupItem>)}
          </RadioGroupRoot>
        </div>
        <div data-case="element"><Pair name="With an element for its text" first={<strong>Bold <em>and</em> nested</strong>} /></div>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
