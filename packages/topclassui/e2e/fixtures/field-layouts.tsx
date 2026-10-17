// Loaded into a live page by e2e/field.spec.ts: a Field with hostile text where a real page puts one. In a grid track of
// 1fr beside a real Input, in a flex-1 column, in a w-fit parent and in a table cell; stacked and inline each time.
// Inline styles: the harness compiles only classes under src/.
import type { CSSProperties, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

import { Checkbox } from '#components/checkbox/index.js'
import { Field } from '#components/field/index.js'
import { Input } from '#components/input/index.js'
import { TopClassProvider } from '#shared/provider/provider.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

const PAGE: CSSProperties = { display: 'grid', gap: 24, padding: 16, alignContent: 'start' }
const CELL: CSSProperties = { border: '1px solid GrayText', padding: 8 }
const WORD = 'Supercalifragilistic'.repeat(15)

/** One stacked Field with a long word in each text, and one inline Field with the same. */
function Pair({ at }: { at: string }) {
  return (
    <>
      <Field name={`${at}-text`} label={WORD} hint={WORD} error={WORD} required data-field={`${at}-stacked`}>
        {(control) => <Input {...control} fullWidth />}
      </Field>
      <Field name={`${at}-box`} label={WORD} hint={WORD} error={WORD} inline data-field={`${at}-inline`}>
        {(control) => <Checkbox {...control} />}
      </Field>
    </>
  )
}

const Case = ({ name, style, children }: { name: string, style: CSSProperties, children: ReactNode }) => <div data-case={name} style={style}>{children}</div>

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div id="layouts" style={PAGE}>
        <Case name="track" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div><Pair at="track" /></div>
          <div><Input aria-label="A real Input beside it" fullWidth /></div>
        </Case>
        <Case name="flex-1" style={{ display: 'flex', gap: 8 }}>
          <span style={{ width: 80, flex: 'none' }}>Side</span>
          <div style={{ flex: 1, minWidth: 0 }}><Pair at="flex" /></div>
        </Case>
        <Case name="w-fit" style={{ width: 'fit-content', maxWidth: '100%' }}><Pair at="fit" /></Case>
        <table data-case="cell" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody><tr><td style={CELL}>Name</td><td style={CELL}><Pair at="cell" /></td></tr></tbody>
        </table>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
