// Loaded into a live page by e2e/date-picker.spec.ts: what a caller can hand a DatePicker that no demo shows. A
// placeholder of one 300-character word, alone and with fullWidth in a table cell; a value that is no day; a value
// outside its range; year 1 and year 9999; Arabic-Indic digits. Inline styles: the harness compiles only src/.
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { DatePicker } from '#components/date-picker/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
const WORD = 'Supercalifragilistic'.repeat(15)

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <form id="hostile" style={{ display: 'grid', gap: 16, padding: 16, justifyItems: 'start' }}>
        <DatePicker aria-label="Long word" name="word" placeholder={WORD} />
        <table style={{ borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid GrayText', padding: 8 }}>
                <DatePicker aria-label="Long word, full width" placeholder={WORD} fullWidth />
              </td>
            </tr>
          </tbody>
        </table>
        <DatePicker aria-label="No such day" name="bad" defaultValue="2026-02-30" />
        <DatePicker aria-label="Outside" name="outside" defaultValue="2030-01-15" minDate="2026-09-25" maxDate="2027-03-31" />
        <DatePicker aria-label="Year one" name="first" defaultValue="0001-01-01" />
        <DatePicker aria-label="Year 9999" name="last" defaultValue="9999-12-31" />
      </form>
      <TopClassProvider direction="rtl" locale="ar-u-nu-arab" numberingSystem="arab">
        <div style={{ padding: 16 }}><DatePicker aria-label="Arabic digits" defaultValue="2026-09-22" /></div>
      </TopClassProvider>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
