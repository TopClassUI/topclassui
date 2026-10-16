// Loaded into a live page by e2e/select.spec.ts: one Select whose placement and spot on the screen a spec sets in
// place, by a `select-case` event, so the six side placements are opened at each corner, in the middle and
// across the screen without a reload. `data-case` on the box says the case has rendered. Inline styles: the harness
// compiles only src/.
import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Select } from '#components/select/index.js'
import type { SelectPlacement } from '#components/select/types.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

const ITEMS = [{ value: 'jo', label: 'Jordan' }, { value: 'eg', label: 'Egypt' }, { value: 'ma', label: 'Morocco' }]

/** The six spots: flush in each corner, in the middle, and across the screen inside a 16 px gutter, where it is fullWidth. */
const SPOTS = {
  'top-start': { top: 0, insetInlineStart: 0 },
  'top-end': { top: 0, insetInlineEnd: 0 },
  'bottom-start': { bottom: 0, insetInlineStart: 0 },
  'bottom-end': { bottom: 0, insetInlineEnd: 0 },
  middle: { top: '50%', insetInlineStart: '50%', translate: direction === 'rtl' ? '50% -50%' : '-50% -50%' },
  'full-width': { top: '40%', insetInline: 16 },
} satisfies Record<string, CSSProperties>
export type Spot = keyof typeof SPOTS
export interface PlacementCase { placement: SelectPlacement, spot: Spot }

function Fixture() {
  const [at, setAt] = useState<PlacementCase>({ placement: 'start', spot: 'middle' })
  useEffect(() => {
    const listen = (event: Event) => { setAt((event as CustomEvent<PlacementCase>).detail) }
    document.addEventListener('select-case', listen)
    return () => { document.removeEventListener('select-case', listen) }
  }, [])
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <form id="placements" data-case={`${at.placement} ${at.spot}`} style={{ position: 'fixed', ...SPOTS[at.spot] }}>
        <Select
          key={at.placement}
          aria-label="Country"
          name="country"
          items={ITEMS}
          defaultValue="jo"
          placement={at.placement}
          fullWidth={at.spot === 'full-width'}
        />
      </form>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
