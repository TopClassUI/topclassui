// Loaded into a live page by e2e/select.spec.ts: what a caller can hand a Select that no demo shows (unit-4.md,
// "Fixtures"). A label of one 300-character word, chosen, alone and with fullWidth in a table cell; an option whose
// value is the empty string, chosen; and sixty options. Inline styles: the harness compiles only src/.
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Select } from '#components/select/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

const WORD = 'Supercalifragilistic'.repeat(15)
const LONG = [{ value: 'long', label: WORD }, { value: 'short', label: 'Short' }]
const EMPTY = [{ value: '', label: 'None' }, { value: 'some', label: 'Some' }]
const SIXTY = Array.from({ length: 60 }, (_, at) => ({ value: String(at + 1), label: `Row ${String(at + 1)}` }))

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <form id="hostile" style={{ display: 'grid', gap: 16, padding: 16, justifyItems: 'start' }}>
        <Select aria-label="Long word" name="word" items={LONG} defaultValue="long" />
        <table style={{ borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid GrayText', padding: 8 }}>
                <Select aria-label="Long word, full width" items={LONG} defaultValue="long" fullWidth />
              </td>
            </tr>
          </tbody>
        </table>
        <Select aria-label="Empty value" name="empty" items={EMPTY} defaultValue="" />
        <Select aria-label="Sixty" name="sixty" items={SIXTY} defaultValue="1" />
      </form>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
