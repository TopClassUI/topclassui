// Loaded into a live page by e2e/date-picker.spec.ts: a DatePicker where a real page puts one. Alone as a grid item,
// in a wrapper in a grid track, in a flex-1 column, in a w-fit parent, in a table cell, in a label row; then two side by
// side in a grid of 1fr 1fr and in a flex row, each alone and in a plain div, one beside a label in a grid of auto 1fr,
// and two Selects and two Inputs in a grid of 1fr 1fr, the widths a pair must match. Inline styles: the harness compiles only src/.
import type { CSSProperties, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { DatePicker } from '#components/date-picker/index.js'
import { Input } from '#components/input/index.js'
import { Select } from '#components/select/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

const PAGE: CSSProperties = { display: 'grid', gap: 24, padding: 16, alignContent: 'start' }
const CELL: CSSProperties = { border: '1px solid GrayText', padding: 8 }
const PAIR: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }

const One = ({ name }: { name: string }) => <DatePicker aria-label={name} defaultValue="2026-09-22" />

/** Two DatePickers side by side, each alone or each in a plain div. */
function Pair({ name, style, wrap }: { name: string, style: CSSProperties, wrap: boolean }) {
  const each = (side: string): ReactNode => (wrap ? <div><One name={`${name} ${side}`} /></div> : <One name={`${name} ${side}`} />)
  return <div data-case={name} style={style}>{each('first')}{each('second')}</div>
}

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div id="layouts" style={PAGE}>
        <div data-case="grid" style={{ display: 'grid' }}><One name="grid" /></div>
        <div data-case="track" style={PAIR}>
          <div><One name="track" /></div>
          <span>Beside</span>
        </div>
        <div data-case="flex-1" style={{ display: 'flex', gap: 8 }}>
          <span style={{ width: 80, flex: 'none' }}>Side</span>
          <div style={{ flex: 1, minWidth: 0 }}><One name="flex-1" /></div>
        </div>
        <div data-case="w-fit" style={{ width: 'fit-content' }}><One name="w-fit" /></div>
        <table data-case="cell" style={{ borderCollapse: 'collapse' }}>
          <tbody><tr><td style={CELL}>Check-in</td><td style={CELL}><One name="cell" /></td></tr></tbody>
        </table>
        <div data-case="label-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span>Date</span>
            <One name="label-row" />
          </div>
        </div>
        <Pair name="grid-pair" style={PAIR} wrap={false} />
        <Pair name="grid-pair-wrapped" style={PAIR} wrap />
        <Pair name="flex-pair" style={{ display: 'flex', gap: 8 }} wrap={false} />
        <Pair name="flex-pair-wrapped" style={{ display: 'flex', gap: 8 }} wrap />
        <div data-case="beside-label" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8, alignItems: 'center' }}>
          <span>Date of arrival</span>
          <One name="beside-label" />
        </div>
        <div data-case="input-pair" style={PAIR}>
          <Input aria-label="Input first" />
          <Input aria-label="Input second" />
        </div>
        <div data-case="select-pair" style={PAIR}>
          <Select aria-label="Select first" items={[{ value: 'a', label: 'Amman' }]} defaultValue="a" />
          <Select aria-label="Select second" items={[{ value: 'a', label: 'Amman' }]} defaultValue="a" />
        </div>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
