// Loaded into a live page by e2e/combobox.spec.ts: a combobox mounted with NO TopClassProvider, which R-13-1 forbids
// and the harness therefore never does. The page it lands on decides what its portal inherits.
import { createRoot } from 'react-dom/client'

import { Combobox } from '#components/combobox/index.js'

const ITEMS = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Bravo' }]

function Fixture() {
  return (
    <div id="no-provider" style={{ padding: '120px 320px' }}>
      <Combobox aria-label="No provider" items={ITEMS} />
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
