// Loaded into a live page by e2e/popover.spec.ts: popovers mounted with NO TopClassProvider, which R-13-1 forbids
// and the harness therefore never does. The page they land on decides what a portal inherits.
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'

import { Button } from '#components/button/index.js'
import {
  PopoverClose, PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger,
} from '#components/popover/index.js'

/** Wide apart and clear of every edge, so no popup has to flip or shift. */
const ROW: CSSProperties = { display: 'flex', justifyContent: 'center', gap: 160, padding: '160px 320px' }
const HEAD: CSSProperties = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }

const PLACEMENTS = ['bottom', 'bottom-start'] as const

function Fixture() {
  return (
    <div id="no-provider" style={ROW}>
      {PLACEMENTS.map((placement) => (
        <PopoverRoot key={placement}>
          <PopoverTrigger render={<Button variant="outline">{placement}</Button>} />
          <PopoverPopup placement={placement}>
            <div style={HEAD}>
              <PopoverTitle>{placement}</PopoverTitle>
              <PopoverClose />
            </div>
            <PopoverDescription>Nothing above this popover names a direction or a language.</PopoverDescription>
          </PopoverPopup>
        </PopoverRoot>
      ))}
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
