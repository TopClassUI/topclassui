// Loaded into a live page by e2e/tooltip.spec.ts: tooltips mounted with NO TopClassProvider, which R-13-1 forbids
// and the harness therefore never does. The page they land on decides what a portal inherits.
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'

import { Button } from '#components/button/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '#components/tooltip/index.js'

/** Wide apart and clear of every edge, so no popup has to flip or shift. */
const ROW: CSSProperties = { display: 'flex', justifyContent: 'center', gap: 160, padding: 120 }

const PLACEMENTS = ['top', 'top-start', 'start', 'end'] as const

function Fixture() {
  return (
    <div id="no-provider" style={ROW}>
      {PLACEMENTS.map((placement) => (
        <TooltipRoot key={placement}>
          <TooltipTrigger render={<Button variant="outline">{placement}</Button>} />
          <TooltipPopup placement={placement}>{placement}</TooltipPopup>
        </TooltipRoot>
      ))}
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
