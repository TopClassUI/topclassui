// Loaded into a live page by e2e/checkbox.spec.ts: a checkbox where a real page puts one, and with hostile content
// around it. Alone as a grid item, in a wrapper in a grid track, in a flex-1 column, in a w-fit parent, in a table
// cell, in a label row inside a column that aligns to the start, beside a 300-character label, named by aria-label
// alone, and inside a label that wraps it with the 300 characters. Inline styles: the harness compiles only src/.
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Checkbox } from '#components/checkbox/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

const PAGE: CSSProperties = { display: 'grid', gap: 24, padding: 16, alignContent: 'start' }
const CELL: CSSProperties = { border: '1px solid GrayText', padding: 8 }
const ROW: CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }
const LONG = 'Notifications'.repeat(24).slice(0, 300)

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div id="layouts" style={PAGE}>
        <div id="grid" data-case="grid" style={{ display: 'grid' }}>
          <Checkbox aria-label="In a grid" />
        </div>
        <div data-case="track" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div><Checkbox aria-label="In a wrapper in a grid track" /></div>
          <span>Beside</span>
        </div>
        <div data-case="flex-1" style={{ display: 'flex', gap: 8 }}>
          <span style={{ width: 80, flex: 'none' }}>Side</span>
          <div style={{ flex: 1, minWidth: 0 }}><Checkbox aria-label="In a flex-1 column" defaultChecked /></div>
        </div>
        <div data-case="w-fit" style={{ width: 'fit-content' }}><Checkbox aria-label="In a w-fit parent" indeterminate /></div>
        <table data-case="cell" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            <tr>
              <td style={CELL}>I accept the terms</td>
              <td style={CELL}><Checkbox aria-label="In a table cell" defaultChecked /></td>
            </tr>
          </tbody>
        </table>
        <div data-case="label-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={ROW}>
            <Checkbox id="layouts-row" />
            <label htmlFor="layouts-row">In a label row</label>
          </div>
        </div>
        <div data-case="long" style={ROW}>
          <Checkbox id="layouts-long" size="sm" />
          <label htmlFor="layouts-long" style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{LONG}</label>
        </div>
        <div data-case="no-label"><Checkbox aria-label="Named by aria-label alone" size="lg" /></div>
        <label data-case="wrapped" style={{ ...ROW, overflowWrap: 'anywhere' }}>
          <Checkbox id="layouts-wrapped" />
          <span style={{ minWidth: 0 }}>{LONG}</span>
        </label>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
