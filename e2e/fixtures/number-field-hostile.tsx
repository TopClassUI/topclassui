// Loaded into a live page by e2e/number-field.spec.ts: what a caller can hand a number field (unit-4.md, "Fixtures"). A
// 300-character word as the placeholder and as the name, an empty value, the largest value the bounds allow, the
// smallest, and a decimal past what the format shows. A number field takes no items, so there is no list of sixty.
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { NumberField } from '#components/number-field/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
const WORD = 'Supercalifragilistic'.repeat(15)

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div id="hostile" style={{ display: 'grid', gap: 16, padding: 16, justifyItems: 'start' }}>
        <NumberField aria-label="A long placeholder" placeholder={WORD} />
        <NumberField aria-label={WORD} defaultValue={3} />
        <NumberField aria-label="Empty" name="empty" />
        <NumberField aria-label="Largest" name="largest" defaultValue={1e20} />
        <NumberField aria-label="Smallest" name="smallest" defaultValue={-1e20} />
        <NumberField aria-label="Long decimal" name="decimal" defaultValue={1 / 3} step="any" fullWidth />
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
