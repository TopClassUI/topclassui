// Loaded into a live page by e2e/popover.spec.ts: what a real app ends up passing. A title of one 300-character
// word beside the x with three long actions, elements where text is expected, and a popover with nothing in it.
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import {
  PopoverClose, PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger,
} from '#components/popover/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

const ROW: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 12, padding: 24 }
const HEAD: CSSProperties = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }
const ACTIONS: CSSProperties = { display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8 }

const WORD = 'a'.repeat(300)
const FILE = 'quarterly-report-final-v2-reviewed-by-legal-and-finance-and-signed-off-by-the-board.pdf'

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div id="hostile" style={ROW}>
        <PopoverRoot>
          <PopoverTrigger render={<Button variant="outline">Long word</Button>} />
          <PopoverPopup aria-label="Long word">
            <div style={HEAD}>
              <PopoverTitle>{WORD}</PopoverTitle>
              <PopoverClose />
            </div>
            <PopoverDescription>{FILE}</PopoverDescription>
            <div style={ACTIONS}>
              <PopoverClose render={<Button variant="outline" size="sm">Keep it where it is</Button>} />
              <PopoverClose render={<Button variant="outline" size="sm">Move a copy and keep the original</Button>} />
              <PopoverClose render={<Button size="sm">Move everything to the archive of the finance team</Button>} />
            </div>
          </PopoverPopup>
        </PopoverRoot>

        <PopoverRoot>
          <PopoverTrigger render={<Button variant="outline">Elements</Button>} />
          <PopoverPopup>
            <PopoverTitle><code>{FILE}</code></PopoverTitle>
            <PopoverDescription render={<div />}>
              <span style={{ display: 'block' }}>A block where a line of text is expected.</span>
              <pre id="pre">const path = &apos;/var/www/releases/2026-10-10/quarterly-report-final-v2.pdf&apos;</pre>
            </PopoverDescription>
          </PopoverPopup>
        </PopoverRoot>

        <PopoverRoot>
          <PopoverTrigger render={<Button variant="outline">Empty</Button>} />
          <PopoverPopup aria-label="Empty">
            <PopoverTitle>{''}</PopoverTitle>
            <PopoverDescription />
          </PopoverPopup>
        </PopoverRoot>

        <PopoverRoot>
          <PopoverTrigger render={<Button variant="outline">Nothing</Button>} />
          <PopoverPopup aria-label="Nothing" />
        </PopoverRoot>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
