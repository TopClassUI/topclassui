// Loaded into a live page by e2e/tree-view.spec.ts: a tree where a real page puts one. Alone as a grid item, in a
// wrapper in a grid track, in a flex-1 column, in a w-fit parent, in a table cell; each holds a 300-character label,
// so nothing can size it by its text. A real Input sits beside it for the widths. Inline styles: the harness compiles only src/.
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Input } from '#components/input/index.js'
import { TreeView } from '#components/tree-view/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
const PAGE: CSSProperties = { display: 'grid', gap: 24, padding: 16, alignContent: 'start' }
const CELL: CSSProperties = { border: '1px solid GrayText', padding: 8 }
const ITEMS = [
  { id: 'long', label: 'Supercalifragilistic'.repeat(15), children: [{ id: 'leaf', label: 'Leaf' }] },
  { id: 'short', label: 'Short' },
]

/** One tree, named by the case it is in. */
const One = ({ name }: { name: string }) => <TreeView aria-label={name} items={ITEMS} defaultExpanded={['long']} />

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div id="layouts" style={PAGE}>
        <div data-case="grid" style={{ display: 'grid' }}><One name="grid" /></div>
        <div data-case="track" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div><One name="track" /></div>
          <Input aria-label="beside" />
        </div>
        <div data-case="flex-1" style={{ display: 'flex', gap: 8 }}>
          <span style={{ width: 80, flex: 'none' }}>Side</span>
          <div style={{ flex: 1, minWidth: 0 }}><One name="flex-1" /></div>
        </div>
        <div data-case="w-fit" style={{ width: 'fit-content' }}><One name="w-fit" /></div>
        <table data-case="cell" style={{ borderCollapse: 'collapse' }}>
          <tbody><tr><td style={CELL}>Files</td><td style={CELL}><One name="cell" /></td></tr></tbody>
        </table>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
