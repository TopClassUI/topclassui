// Loaded into a live page by e2e/switch.spec.ts: a switch where a real page puts one, and with hostile content
// around it. Alone as a grid item, in a wrapper in a grid track, in a flex-1 column, in a w-fit parent, in a table
// cell, in a label row inside a column that aligns to the start, beside a 300-character label, named by aria-label
// alone, and size="custom" sized by the caller. Inline styles, since the harness compiles only the classes it finds under src/.
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Switch } from '#components/switch/index.js'

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
          <Switch aria-label="In a grid" />
        </div>
        <div data-case="track" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div><Switch aria-label="In a wrapper in a grid track" /></div>
          <span>Beside</span>
        </div>
        <div data-case="flex-1" style={{ display: 'flex', gap: 8 }}>
          <span style={{ width: 80, flex: 'none' }}>Side</span>
          <div style={{ flex: 1, minWidth: 0 }}><Switch aria-label="In a flex-1 column" defaultChecked /></div>
        </div>
        <div data-case="w-fit" style={{ width: 'fit-content' }}><Switch aria-label="In a w-fit parent" /></div>
        <table data-case="cell" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            <tr>
              <td style={CELL}>Weekly digest</td>
              <td style={CELL}><Switch aria-label="In a table cell" defaultChecked /></td>
            </tr>
          </tbody>
        </table>
        <div data-case="label-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={ROW}>
            <Switch id="layouts-row" />
            <label htmlFor="layouts-row">In a label row</label>
          </div>
        </div>
        <div data-case="long" style={ROW}>
          <Switch id="layouts-long" size="sm" />
          <label htmlFor="layouts-long" style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{LONG}</label>
        </div>
        <div data-case="no-label"><Switch aria-label="Named by aria-label alone" size="lg" /></div>
        {/* size="custom" sized as its README says, from the caller's own CSS: once in px, once in rem. */}
        <style>{'[data-case="custom"] > [data-size="custom"] > span { width: 48px; height: 24px } [data-case="custom"] > [data-size="custom"].rem > span { width: 3rem; height: 1.25rem }'}</style>
        <div data-case="custom" style={ROW}>
          <Switch aria-label="Custom, off" size="custom" />
          <Switch aria-label="Custom, on" size="custom" defaultChecked />
          <Switch aria-label="Custom in rem, on" size="custom" className="rem" defaultChecked />
        </div>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
