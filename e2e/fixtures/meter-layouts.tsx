// Loaded into a live page by e2e/meter.spec.ts: a meter where a real page puts one. Alone as a grid item, in a wrapper
// in a grid track, in a flex-1 column, in a w-fit parent (bare and with a width of its own), in a table cell (bare and
// with a width of its own), in a flex row beside its label; then hostile input: a 300-character label, values past the
// range, NaN and infinities, a max below its min, a NaN max, a NaN min. Inline styles: the harness compiles only src/.
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'

import { Meter } from '#components/meter/index.js'

const PAGE: CSSProperties = { display: 'grid', gap: 24, padding: 16, alignContent: 'start' }
const CELL: CSSProperties = { border: '1px solid GrayText', padding: 8 }
const PAIR: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }
const WORD = 'Supercalifragilistic'.repeat(15)

function Fixture() {
  return (
    <div id="layouts" style={PAGE}>
      <div data-case="grid" style={{ display: 'grid' }}><Meter value={50} aria-label="In a grid" /></div>
      <div data-case="track" style={PAIR}><div><Meter value={50} aria-label="In a wrapper in a grid track" /></div><span>Beside</span></div>
      <div data-case="flex-1" style={{ display: 'flex', gap: 8 }}>
        <span style={{ width: 80, flex: 'none' }}>Side</span>
        <div style={{ flex: 1, minWidth: 0 }}><Meter value={50} aria-label="In a flex-1 column" /></div>
      </div>
      <div data-case="w-fit" style={{ width: 'fit-content' }}><Meter value={50} aria-label="In a w-fit parent" /></div>
      <div data-case="w-fit-sized" style={{ width: 'fit-content' }}><Meter value={50} style={{ width: 160 }} aria-label="Sized, in a w-fit parent" /></div>
      <table data-case="cell" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <tbody><tr><td style={CELL}>Disk</td><td style={CELL}><Meter value={50} aria-label="In a table cell" /></td></tr></tbody>
      </table>
      <table data-case="cell-sized" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <tbody><tr><td style={CELL}>Disk</td><td style={CELL}><Meter value={50} style={{ width: 160 }} aria-label="Sized, in a table cell" /></td></tr></tbody>
      </table>
      <div data-case="row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span id="layouts-row" style={{ flex: 'none' }}>Battery</span>
        <Meter value={50} aria-labelledby="layouts-row" />
      </div>
      <div data-case="word" style={{ display: 'grid', gap: 4 }}>
        <span id="layouts-word" style={{ overflowWrap: 'anywhere' }}>{WORD}</span>
        <Meter value={50} aria-labelledby="layouts-word" />
      </div>
      <div data-case="hostile" style={{ display: 'grid', gap: 4 }}>
        <Meter value={1e308} aria-label="Past the max" />
        <Meter value={-1e308} aria-label="Past the min" />
        <Meter value={Number.NaN} aria-label="Not a number" />
        <Meter min={Number.NEGATIVE_INFINITY} max={Number.POSITIVE_INFINITY} value={0} aria-label="Infinite range" />
        <Meter min={10} max={5} value={7} aria-label="Max below min" />
        <Meter max={Number.NaN} value={50} aria-label="A NaN max" />
        <Meter min={Number.NaN} value={50} aria-label="A NaN min" />
      </div>
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
