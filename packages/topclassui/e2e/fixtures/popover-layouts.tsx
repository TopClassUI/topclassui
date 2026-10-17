// Loaded into a live page by e2e/popover.spec.ts: a trigger where a real page puts one. In a sticky header, in
// a table cell, in a box that scrolls and clips, in a grid track, in a flex-1 column and in a w-fit parent.
// Inline styles, since the harness compiles only the classes it finds under src/.
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import { PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger } from '#components/popover/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

const PAGE: CSSProperties = { display: 'grid', gap: 24, padding: 24, minHeight: '250vh', alignContent: 'start' }
const HEADER: CSSProperties = {
  position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'flex-end', padding: 8,
  background: 'Canvas', borderBottom: '1px solid GrayText',
}
/** A layer of the page's own, under where the header's popup opens: the popup must still paint above it. */
const TABLE: CSSProperties = { position: 'relative', zIndex: 5, borderCollapse: 'collapse', width: '100%', background: 'Canvas' }
const CLIP: CSSProperties = { height: 160, overflow: 'auto', border: '1px solid GrayText', padding: 8 }
const CELL: CSSProperties = { border: '1px solid GrayText', padding: 8 }

function One({ name }: { name: string }) {
  return (
    <PopoverRoot>
      <PopoverTrigger render={<Button variant="outline" size="sm">{name}</Button>} />
      <PopoverPopup>
        <PopoverTitle>{name}</PopoverTitle>
        <PopoverDescription>The popup is portaled into the body, so nothing around its trigger clips it.</PopoverDescription>
      </PopoverPopup>
    </PopoverRoot>
  )
}

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div id="layouts" style={PAGE}>
        <header id="sticky" style={HEADER}><One name="In a sticky header" /></header>
        <table style={TABLE}>
          <tbody>
            <tr>
              <td style={CELL}>Website redesign</td>
              <td style={CELL}><One name="In a table cell" /></td>
            </tr>
          </tbody>
        </table>
        <div id="clip" style={CLIP}>
          <div style={{ height: 60 }} />
          <One name="In a box that clips" />
          <div style={{ height: 600 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <span>One</span>
          <One name="In a grid track" />
          <span>Three</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ width: 80, flex: 'none' }}>Side</span>
          <div style={{ flex: 1, minWidth: 0 }}><One name="In a flex-1 column" /></div>
        </div>
        <div style={{ width: 'fit-content' }}><One name="In a w-fit parent" /></div>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
