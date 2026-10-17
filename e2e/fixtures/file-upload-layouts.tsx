// Loaded into a live page by e2e/file-upload.spec.ts: an upload where a real page puts one, beside a real Input. Alone
// as a grid item, in a wrapper in a grid track, in a flex-1 column, in a w-fit parent, in a table cell, in a label row
// inside a column that aligns to the start. Inline styles, since the harness compiles only the classes under src/.
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { FileUpload } from '#components/file-upload/index.js'
import { Input } from '#components/input/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

const PAGE: CSSProperties = { display: 'grid', gap: 24, padding: 16, alignContent: 'start' }
const CELL: CSSProperties = { border: '1px solid GrayText', padding: 8 }

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div id="layouts" style={PAGE}>
        <div id="grid" data-case="grid" style={{ display: 'grid' }}>
          <FileUpload aria-label="In a grid" maxFiles={100} />
        </div>
        <div data-case="track" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div><FileUpload aria-label="In a wrapper in a grid track" maxFiles={100} /></div>
          <div><Input aria-label="Beside it" fullWidth /></div>
        </div>
        <div data-case="flex-1" style={{ display: 'flex', gap: 8 }}>
          <span style={{ width: 80, flex: 'none' }}>Side</span>
          <div style={{ flex: 1, minWidth: 0 }}><FileUpload aria-label="In a flex-1 column" maxFiles={100} /></div>
        </div>
        <div data-case="w-fit" style={{ width: 'fit-content', maxWidth: '100%' }}><FileUpload aria-label="In a w-fit parent" maxFiles={100} /></div>
        <table data-case="cell" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            <tr>
              <td style={CELL}>Attachments</td>
              <td style={CELL}><FileUpload aria-label="In a table cell" maxFiles={100} /></td>
            </tr>
          </tbody>
        </table>
        <div data-case="label-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
          <label htmlFor="layouts-row">In a label row</label>
          <FileUpload id="layouts-row" maxFiles={100} />
          <Input aria-label="Under it" />
        </div>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
