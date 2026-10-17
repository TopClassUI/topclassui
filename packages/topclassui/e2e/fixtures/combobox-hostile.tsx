// Loaded into a live page by e2e/combobox.spec.ts: what a careless caller hands a combobox (unit-4.md, "Fixtures"). A
// 300-character word as the chosen label, an option whose value is the empty string, and sixty options.
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Combobox } from '#components/combobox/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
const WORD = 'Supercalifragilistic'.repeat(15)
const LONG = [{ value: 'long', label: WORD }, { value: 'short', label: 'Short' }]
const EMPTY = [{ value: '', label: 'None' }, { value: 'some', label: 'Some' }]
const SIXTY = Array.from({ length: 60 }, (_, at) => ({ value: String(at + 1), label: `Section ${String(at + 1)}` }))

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <form id="hostile" style={{ display: 'grid', gap: 24, padding: 16, alignContent: 'start', justifyItems: 'start' }}>
        <Combobox aria-label="A long word" name="word" items={LONG} defaultValue="long" />
        <Combobox aria-label="A long word, full width" name="wide" fullWidth items={LONG} defaultValue="long" />
        <Combobox aria-label="An empty value" name="empty" items={EMPTY} defaultValue="" />
        <Combobox aria-label="Sixty" name="sixty" items={SIXTY} defaultValue="1" />
      </form>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
