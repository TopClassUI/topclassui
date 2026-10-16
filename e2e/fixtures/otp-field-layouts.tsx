// Loaded into a live page by e2e/otp-field.spec.ts: a code field where a real page puts one. In a block, alone as a grid
// item, in a wrapper in a grid track, in a flex column, in a label row, in a flex-1 column, in a w-fit parent, in a table
// cell, beside a label in a grid of `auto 1fr`, two side by side in a flex row that wraps, and two in a grid of `1fr 1fr`,
// in wrappers and as grid items. Inline styles: the harness compiles only src/.
import type { CSSProperties, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { OTPField } from '#components/otp-field/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

const PAGE: CSSProperties = { display: 'grid', gap: 24, padding: 16, alignContent: 'start' }
const CELL: CSSProperties = { border: '1px solid GrayText', padding: 8 }

/** Six cells, named by the text before them, so every case is a real form row. */
function Six({ name }: { name: string }) {
  const id = `layouts-${name.toLowerCase().replace(/\W+/g, '-')}`
  return <><span id={id}>{name}</span><OTPField aria-labelledby={id} /></>
}

function Case({ name, style, children }: { name: string, style?: CSSProperties, children: ReactNode }) {
  return <div data-case={name} style={style}>{children}</div>
}

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div id="layouts" style={PAGE}>
        <Case name="block"><Six name="In a block" /></Case>
        <Case name="grid" style={{ display: 'grid' }}><Six name="In a grid" /></Case>
        <Case name="track" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div><Six name="In a wrapper in a grid track" /></div>
          <span>Beside</span>
        </Case>
        <Case name="flex-column" style={{ display: 'flex', flexDirection: 'column' }}><Six name="In a flex column" /></Case>
        <Case name="label-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, maxWidth: '100%' }}><Six name="Code" /></div>
        </Case>
        <Case name="flex-1" style={{ display: 'flex', gap: 8 }}>
          <span style={{ width: 80, flex: 'none' }}>Side</span>
          <div style={{ flex: 1, minWidth: 0 }}><Six name="In a flex-1 column" /></div>
        </Case>
        <Case name="w-fit" style={{ width: 'fit-content', maxWidth: '100%' }}><Six name="In a w-fit parent" /></Case>
        <table data-case="cell" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            <tr>
              <td style={CELL}>Code</td>
              <td style={CELL}><Six name="In a table cell" /></td>
            </tr>
          </tbody>
        </table>
        <Case name="auto-1fr" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8, alignItems: 'center' }}>
          <Six name="Beside a label" />
        </Case>
        {/* Two fields of six have a floor of 2 x 184 px plus the gap: a row that does not wrap scrolls a 320 px page. */}
        <Case name="pair" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <div><Six name="First of two" /></div>
          <div><Six name="Second of two" /></div>
        </Case>
        {/* A column of 140 px at 320 px, under the 184 px floor of six cells: each field wraps inside its own column. */}
        <Case name="halves" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div><Six name="Left half" /></div>
          <div><Six name="Right half" /></div>
        </Case>
        <Case name="halves-direct" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <OTPField aria-labelledby="layouts-left-half" />
          <OTPField aria-labelledby="layouts-right-half" />
        </Case>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
