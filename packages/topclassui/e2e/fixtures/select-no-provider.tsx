// Loaded into a live page by e2e/select.spec.ts: a Select mounted with NO TopClassProvider, which R-13-1 forbids
// and the harness therefore never does. The page it lands on decides what its portal inherits.
import { createRoot } from 'react-dom/client'

import { Select } from '#components/select/index.js'

const ITEMS = [{ value: 'jo', label: 'Jordan' }, { value: 'eg', label: 'Egypt' }]

function Fixture() {
  return (
    <div id="no-provider" style={{ display: 'flex', justifyContent: 'center', padding: '160px 320px' }}>
      <Select aria-label="Country" items={ITEMS} defaultValue="jo" />
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
