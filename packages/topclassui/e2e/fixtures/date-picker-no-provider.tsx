// Loaded into a live page by e2e/date-picker.spec.ts: a DatePicker mounted with NO TopClassProvider, which R-13-1
// forbids and the harness therefore never does. It formats in English, and the page decides what its portal inherits.
import { createRoot } from 'react-dom/client'

import { DatePicker } from '#components/date-picker/index.js'

function Fixture() {
  return (
    <div id="no-provider" style={{ display: 'flex', justifyContent: 'center', padding: '160px 320px' }}>
      <DatePicker aria-label="Check-in" name="checkIn" defaultValue="2026-09-22" />
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
