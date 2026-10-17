// Loaded into a live page by e2e/combobox.spec.ts: a combobox where a real page puts one (unit-4.md, "Fixtures"). Alone
// as a grid item, in a wrapper in a grid track, in a flex-1 column, in a w-fit parent, in a table cell, in a label row;
// then two side by side in a grid of 1fr 1fr and in a flex row, alone and in wrappers, and one beside a label in a grid
// of auto 1fr. Inline styles: the harness compiles only src/.
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Combobox } from '#components/combobox/index.js'
import { Input } from '#components/input/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
const PAGE: CSSProperties = { display: 'grid', gap: 24, padding: 16, alignContent: 'start' }
const CELL: CSSProperties = { border: '1px solid GrayText', padding: 8 }
const ITEMS = [{ value: 'jo', label: 'Jordan' }, { value: 'long', label: 'Supercalifragilistic'.repeat(15) }]

/** One combobox, named by the case it is in, holding the long word so nothing can size it by its text. */
const One = ({ name }: { name: string }) => <Combobox aria-label={name} items={ITEMS} defaultValue="long" />

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div id="layouts" style={PAGE}>
        <div data-case="grid" style={{ display: 'grid' }}><One name="grid" /></div>
        <div data-case="track" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div><One name="track" /></div>
          <span>Beside</span>
        </div>
        <div data-case="flex-1" style={{ display: 'flex', gap: 8 }}>
          <span style={{ width: 80, flex: 'none' }}>Side</span>
          <div style={{ flex: 1, minWidth: 0 }}><One name="flex-1" /></div>
        </div>
        <div data-case="w-fit" style={{ width: 'fit-content' }}><One name="w-fit" /></div>
        <table data-case="cell" style={{ borderCollapse: 'collapse' }}>
          <tbody><tr><td style={CELL}>Country</td><td style={CELL}><One name="cell" /></td></tr></tbody>
        </table>
        <div data-case="label-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span>Country</span>
            <One name="label-row" />
          </div>
        </div>
        <div data-case="pair-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <One name="pair-grid" /><One name="pair-grid" />
        </div>
        <div data-case="pair-grid-wrapped" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div><One name="pair-grid-wrapped" /></div><div><One name="pair-grid-wrapped" /></div>
        </div>
        <div data-case="pair-input" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Input aria-label="pair-input" /><Input aria-label="pair-input" />
        </div>
        <div data-case="pair-flex" style={{ display: 'flex', gap: 8 }}>
          <One name="pair-flex" /><One name="pair-flex" />
        </div>
        <div data-case="pair-flex-wrapped" style={{ display: 'flex', gap: 8 }}>
          <div style={{ minWidth: 0 }}><One name="pair-flex-wrapped" /></div><div style={{ minWidth: 0 }}><One name="pair-flex-wrapped" /></div>
        </div>
        <div data-case="beside-label" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8, alignItems: 'center' }}>
          <span>Country</span><One name="beside-label" />
        </div>
        <div data-case="beside-label-wrapped" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8, alignItems: 'center' }}>
          <span>Country</span><div><One name="beside-label-wrapped" /></div>
        </div>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
