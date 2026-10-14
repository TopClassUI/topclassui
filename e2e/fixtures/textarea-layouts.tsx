// Loaded into a live page by e2e/textarea.spec.ts: a textarea where a real page puts one (unit-4.md, "Fixtures"). Alone
// as a grid item, in a wrapper in a grid track, in a flex-1 column, in a w-fit parent, in a table cell, in a label row
// inside a column that aligns to the start; the holder in a w-fit parent and a table cell; then two side by side, in a
// grid written 1fr 1fr, in a flex row, each in a plain div, and one beside a label in a grid of auto 1fr. Last, hostile
// text: a 300-character word, an empty value, sixty lines. Inline styles: the harness compiles only classes under src/.
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Textarea } from '#components/textarea/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

const PAGE: CSSProperties = { display: 'grid', gap: 24, padding: 16, alignContent: 'start' }
const CELL: CSSProperties = { border: '1px solid GrayText', padding: 8 }
const ROW: CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }
const PAIR: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }
const WORD = 'Supercalifragilistic'.repeat(15)
const LINES = Array.from({ length: 60 }, (_, line) => `Line ${String(line + 1)}`).join('\n')

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div id="layouts" style={PAGE}>
        <div data-case="grid" style={{ display: 'grid' }}><Textarea aria-label="In a grid" /></div>
        <div data-case="track" style={PAIR}><div><Textarea aria-label="In a wrapper in a grid track" /></div><span>Beside</span></div>
        <div data-case="flex-1" style={{ display: 'flex', gap: 8 }}>
          <span style={{ width: 80, flex: 'none' }}>Side</span>
          <div style={{ flex: 1, minWidth: 0 }}><Textarea aria-label="In a flex-1 column" /></div>
        </div>
        <div data-case="w-fit" style={{ width: 'fit-content' }}><Textarea aria-label="In a w-fit parent" /></div>
        <table data-case="cell" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody><tr><td style={CELL}>Notes</td><td style={CELL}><Textarea aria-label="In a table cell" /></td></tr></tbody>
        </table>
        <div data-case="label-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={ROW}><label htmlFor="layouts-row">In a label row</label><Textarea id="layouts-row" /></div>
        </div>
        <div data-case="held-w-fit" style={{ width: 'fit-content' }}><Textarea aria-label="Held, in a w-fit parent" autosize showCount /></div>
        <table data-case="held-cell" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody><tr><td style={CELL}>Notes</td><td style={CELL}><Textarea aria-label="Held, in a table cell" showCount /></td></tr></tbody>
        </table>
        <div data-case="pair-grid" style={PAIR}><Textarea aria-label="Grid, first" /><Textarea aria-label="Grid, second" /></div>
        <div data-case="pair-flex" style={{ display: 'flex', gap: 8 }}><Textarea aria-label="Flex, first" /><Textarea aria-label="Flex, second" /></div>
        <div data-case="pair-div" style={PAIR}><div><Textarea aria-label="Wrapped, first" /></div><div><Textarea aria-label="Wrapped, second" /></div></div>
        <div data-case="pair-held" style={{ display: 'flex', gap: 8 }}><Textarea aria-label="Held, first" autosize showCount /><Textarea aria-label="Held, second" autosize showCount /></div>
        <div data-case="beside-label" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8, alignItems: 'start' }}>
          <label htmlFor="layouts-beside">Beside a label</label><Textarea id="layouts-beside" />
        </div>
        <div data-case="word" style={{ display: 'grid', gap: 8 }}>
          <Textarea aria-label="A word, own width" defaultValue={WORD} />
          <Textarea aria-label="A word, held" defaultValue={WORD} showCount />
          <Textarea aria-label="A word, full width" defaultValue={WORD} fullWidth />
        </div>
        <div data-case="word-cell" style={{ width: 'fit-content' }}><Textarea aria-label="A word, in a w-fit parent" defaultValue={WORD} autosize /></div>
        <div data-case="empty"><Textarea aria-label="Empty" defaultValue="" showCount /></div>
        <div data-case="lines" style={{ display: 'grid', gap: 8 }}>
          <Textarea aria-label="Sixty lines" defaultValue={LINES} />
          <Textarea aria-label="Sixty lines, autosize" defaultValue={LINES} autosize />
        </div>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
