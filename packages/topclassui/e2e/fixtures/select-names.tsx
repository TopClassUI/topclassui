// Loaded into a live page by e2e/select.spec.ts: the ways a page names a Select that no demo shows, so the open
// list can be checked to carry the field's name too. A label that wraps the Select, an aria-labelledby that points at
// a heading, and an aria-label alone. Inline styles: the harness compiles only src/.
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Select } from '#components/select/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

const ITEMS = [{ value: 'jo', label: 'Jordan' }, { value: 'eg', label: 'Egypt' }]

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <form id="names" style={{ display: 'grid', gap: 16, padding: 16, justifyItems: 'start' }}>
        <label style={{ display: 'grid', gap: 4 }}>
          Wrapped label
          <Select id="names-wrapped" name="wrapped" items={ITEMS} defaultValue="jo" />
        </label>
        <h2 id="names-heading" style={{ margin: 0, fontSize: 16 }}>Heading name</h2>
        <Select aria-labelledby="names-heading" name="heading" items={ITEMS} defaultValue="jo" />
        <Select aria-label="Plain name" name="plain" items={ITEMS} defaultValue="jo" />
      </form>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
