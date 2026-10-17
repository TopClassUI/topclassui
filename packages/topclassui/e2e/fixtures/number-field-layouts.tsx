// Loaded into a live page by e2e/number-field.spec.ts: a number field where a real page puts one (unit-4.md, "Fixtures").
// Alone as a grid item, in a wrapper in a grid track, in a flex-1 column, in a w-fit parent, in a table cell, in a label
// row inside a column that aligns to the start; then two side by side, in a grid written 1fr 1fr, in a flex row, each in
// a plain div, and one beside a label in a grid of auto 1fr. Inline styles: the harness compiles only classes under src/.
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Input } from '#components/input/index.js'
import { NumberField } from '#components/number-field/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

const PAGE: CSSProperties = { display: 'grid', gap: 24, padding: 16, alignContent: 'start' }
const CELL: CSSProperties = { border: '1px solid GrayText', padding: 8 }
const ROW: CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }
const PAIR: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div id="layouts" style={PAGE}>
        <div data-case="grid" style={{ display: 'grid' }}><NumberField aria-label="In a grid" defaultValue={12} /></div>
        <div data-case="track" style={PAIR}><div><NumberField aria-label="In a wrapper in a grid track" defaultValue={12} /></div><span>Beside</span></div>
        <div data-case="flex-1" style={{ display: 'flex', gap: 8 }}>
          <span style={{ width: 80, flex: 'none' }}>Side</span>
          <div style={{ flex: 1, minWidth: 0 }}><NumberField aria-label="In a flex-1 column" defaultValue={12} /></div>
        </div>
        <div data-case="w-fit" style={{ width: 'fit-content' }}><NumberField aria-label="In a w-fit parent" defaultValue={12} /></div>
        <table data-case="cell" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody><tr><td style={CELL}>Guests</td><td style={CELL}><NumberField aria-label="In a table cell" defaultValue={12} /></td></tr></tbody>
        </table>
        <div data-case="label-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={ROW}><label htmlFor="layouts-row">In a label row</label><NumberField id="layouts-row" defaultValue={12} /></div>
        </div>
        <div data-case="pair-grid" style={PAIR}><NumberField aria-label="Grid, first" defaultValue={1} /><NumberField aria-label="Grid, second" defaultValue={2} /></div>
        <div data-case="pair-flex" style={{ display: 'flex', gap: 8 }}><NumberField aria-label="Flex, first" defaultValue={1} /><NumberField aria-label="Flex, second" defaultValue={2} /></div>
        <div data-case="pair-div" style={PAIR}><div><NumberField aria-label="Wrapped, first" defaultValue={1} /></div><div><NumberField aria-label="Wrapped, second" defaultValue={2} /></div></div>
        <div data-case="pair-input" style={PAIR}><Input aria-label="Input, first" /><Input aria-label="Input, second" /></div>
        <div data-case="beside-label" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8, alignItems: 'center' }}>
          <label htmlFor="layouts-beside">Beside a label</label><NumberField id="layouts-beside" defaultValue={12} />
        </div>
        <label data-case="wrapping-label" style={{ display: 'grid', gap: 4, justifyItems: 'start' }}>
          Inside a label<NumberField defaultValue={12} aria-labelledby="layouts-wrapped" />
          <span id="layouts-wrapped">Wrapped by a label</span>
        </label>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
