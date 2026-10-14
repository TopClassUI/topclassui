// Loaded into a live page by e2e/slider.spec.ts: a slider where a real page puts one. Alone as a grid item, in a wrapper
// in a grid track, in a flex-1 column, in a w-fit parent, in a table cell, in a label row inside a column that aligns to
// the start, in a 120 px flex row; two side by side in a grid of 1fr 1fr, in a flex row, each alone and each in a plain
// div, beside two Inputs to compare; one beside a label in a grid of auto 1fr; and two at the ends, 0 and 100.
// Inline styles: the harness compiles only src/.
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'

import { Input } from '#components/input/index.js'
import { Slider } from '#components/slider/index.js'
import { TopClassProvider } from '#shared/provider/provider.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

const PAGE: CSSProperties = { display: 'grid', gap: 24, padding: 16, alignContent: 'start' }
const CELL: CSSProperties = { border: '1px solid GrayText', padding: 8 }
const PAIR: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }
const ROW: CSSProperties = { display: 'flex', gap: 8 }

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div id="layouts" style={PAGE}>
        <div id="grid" data-case="grid" style={{ display: 'grid' }}><Slider aria-label="In a grid" defaultValue={40} /></div>
        <div data-case="track" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div><Slider aria-label="In a wrapper in a grid track" defaultValue={40} /></div>
          <span>Beside</span>
        </div>
        <div data-case="flex-1" style={{ display: 'flex', gap: 8 }}>
          <span style={{ width: 80, flex: 'none' }}>Side</span>
          <div style={{ flex: 1, minWidth: 0 }}><Slider aria-label="In a flex-1 column" defaultValue={40} /></div>
        </div>
        <div data-case="w-fit" style={{ width: 'fit-content' }}><Slider aria-label="In a w-fit parent" defaultValue={40} /></div>
        <table data-case="cell" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            <tr>
              <td style={CELL}>Volume</td>
              <td style={CELL}><Slider aria-label="In a table cell" defaultValue={40} /></td>
            </tr>
          </tbody>
        </table>
        <div data-case="label-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span id="layouts-row">In a label row</span>
            <Slider aria-labelledby="layouts-row" defaultValue={40} />
          </div>
        </div>
        <div data-case="narrow" style={{ display: 'flex', width: 120 }}><Slider aria-label="In a 120 px row" defaultValue={40} /></div>
        <div style={PAIR}><Input id="input-a" aria-label="First input" /><Input id="input-b" aria-label="Second input" /></div>
        <div data-pair="grid" style={PAIR}><Slider aria-label="Grid A" defaultValue={40} /><Slider aria-label="Grid B" defaultValue={[20, 80]} /></div>
        <div data-pair="grid-divs" style={PAIR}>
          <div><Slider aria-label="Grid div A" defaultValue={40} /></div>
          <div><Slider aria-label="Grid div B" defaultValue={40} showValue /></div>
        </div>
        <div data-pair="row" style={ROW}><Slider aria-label="Row A" defaultValue={40} /><Slider aria-label="Row B" defaultValue={[20, 80]} /></div>
        <div data-pair="row-divs" style={ROW}>
          <div><Slider aria-label="Row div A" defaultValue={40} /></div>
          <div><Slider aria-label="Row div B" defaultValue={40} showValue /></div>
        </div>
        <div data-pair="label" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8, alignItems: 'center' }}>
          <span id="layouts-beside">Volume of the alarm</span>
          <Slider aria-labelledby="layouts-beside" defaultValue={40} />
        </div>
        <div data-pair="ends" style={{ display: 'grid', gap: 8 }}>
          <Slider aria-label="At 0" defaultValue={0} />
          <Slider aria-label="At 100" defaultValue={100} />
          <Slider aria-label="A range at both ends" defaultValue={[0, 100]} />
        </div>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
