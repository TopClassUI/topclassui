// Loaded into a live page by e2e/otp-field.spec.ts: what a careless caller hands a code field (unit-4.md, "Fixtures").
// A default of 300 characters, an empty one, one of letters and Arabic-Indic digits, a label of one 300-character word,
// a length of 99 and a group longer than the code.
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { OTPField } from '#components/otp-field/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
const WORD = 'Supercalifragilistic'.repeat(15)

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <form id="hostile" style={{ display: 'grid', gap: 24, padding: 16, alignContent: 'start' }}>
        <span id="hostile-long" style={{ overflowWrap: 'anywhere' }}>{WORD}</span>
        <OTPField aria-labelledby="hostile-long" name="long" defaultValue={'9'.repeat(300)} />
        <label htmlFor="hostile-empty">Empty</label>
        <OTPField id="hostile-empty" name="empty" defaultValue="" />
        <label htmlFor="hostile-mixed">Mixed</label>
        <OTPField id="hostile-mixed" name="mixed" defaultValue="a٤b٨ ۲x" />
        <label htmlFor="hostile-many">Many</label>
        <OTPField id="hostile-many" name="many" length={99} groupSize={99} />
      </form>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
