// Loaded into a live page by e2e/number-field.spec.ts: a number field inside a fieldset that disables it, which Base UI
// never hears of, beside an Input in the same fieldset, a field disabled by its own prop, and a live one at its max.
// The button outside the fieldset turns it on and off. Inline styles: the harness compiles only classes under src/.
import { useState } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Input } from '#components/input/index.js'
import { NumberField } from '#components/number-field/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

function Fixture() {
  const [off, setOff] = useState(true)
  return (
    <TopClassProvider direction={direction} locale="en">
      <form id="fieldset" style={{ display: 'grid', gap: 16, padding: 16, justifyItems: 'start' }}>
        <fieldset disabled={off} style={{ display: 'grid', gap: 8, border: 0, padding: 0, margin: 0 }}>
          <NumberField aria-label="In the fieldset" name="inside" defaultValue={3} />
          <NumberField aria-label="At max in the fieldset" name="top" defaultValue={8} max={8} />
          <Input aria-label="An Input in the fieldset" name="plain" defaultValue="Jordan" />
        </fieldset>
        <NumberField aria-label="Disabled by its prop" defaultValue={3} disabled />
        <NumberField aria-label="Live at max" defaultValue={8} max={8} />
        <button type="button" onClick={() => { setOff(!off) }}>Toggle</button>
      </form>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
