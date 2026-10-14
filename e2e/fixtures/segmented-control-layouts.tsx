// Loaded into a live page by e2e/segmented-control.spec.ts: a segmented control where a real page puts one. In a block,
// as a grid item, in a wrapper in a grid track, in a flex column, in a label row inside a column that aligns to the
// start, in a flex-1 column, in a w-fit parent, in a table cell, and full width in a flex row. Each case holds three
// short segments and the seven long ones of the `many` demo. Inline styles: the harness compiles only src/.
import type { CSSProperties, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { SegmentedControlItem, SegmentedControlRoot } from '#components/segmented-control/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

const PAGE: CSSProperties = { display: 'grid', gap: 24, padding: 16, alignContent: 'start' }
const CELL: CSSProperties = { border: '1px solid GrayText', padding: 8 }
const SEVEN = ['Overview', 'Activity log', 'Team members', 'Billing and invoices', 'Integrations', 'Security settings', 'Notifications']

/** The three of the docs sample and the seven long ones, named by the case. */
function Pair({ name, fullWidth }: { name: string, fullWidth?: boolean }) {
  return (
    <>
      <SegmentedControlRoot aria-label={`${name}, three`} defaultValue="board" fullWidth={fullWidth} data-track="three">
        <SegmentedControlItem value="board">Board</SegmentedControlItem>
        <SegmentedControlItem value="table">Table</SegmentedControlItem>
        <SegmentedControlItem value="calendar">Calendar</SegmentedControlItem>
      </SegmentedControlRoot>
      <SegmentedControlRoot aria-label={`${name}, seven`} defaultValue="Overview" fullWidth={fullWidth} data-track="seven">
        {SEVEN.map((section) => <SegmentedControlItem key={section} value={section}>{section}</SegmentedControlItem>)}
      </SegmentedControlRoot>
    </>
  )
}

function Case({ name, style, children }: { name: string, style?: CSSProperties, children: ReactNode }) {
  return <div data-case={name} style={style}>{children}</div>
}

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div id="layouts" style={PAGE}>
        <Case name="block"><Pair name="In a block" /></Case>
        <Case name="grid" style={{ display: 'grid' }}><Pair name="As a grid item" /></Case>
        <Case name="track" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div><Pair name="In a wrapper in a grid track" /></div>
          <span>Beside</span>
        </Case>
        <Case name="flex-col" style={{ display: 'flex', flexDirection: 'column' }}><Pair name="In a flex column" /></Case>
        <Case name="label-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span>Label</span>
            <div><Pair name="In a label row" /></div>
          </div>
        </Case>
        <Case name="flex-1" style={{ display: 'flex', gap: 8 }}>
          <span style={{ width: 80, flex: 'none' }}>Side</span>
          <div style={{ flex: 1, minWidth: 0 }}><Pair name="In a flex-1 column" /></div>
        </Case>
        <Case name="w-fit" style={{ width: 'fit-content', maxWidth: '100%' }}><Pair name="In a w-fit parent" /></Case>
        <Case name="cell">
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              <tr>
                <td style={CELL}>View</td>
                <td style={CELL}><Pair name="In a table cell" /></td>
              </tr>
            </tbody>
          </table>
        </Case>
        <Case name="full" style={{ display: 'flex', flexDirection: 'column' }}><Pair name="Full width" fullWidth /></Case>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
