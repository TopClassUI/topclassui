// Loaded into a live page by e2e/scroll-area.spec.ts: SCROLL_AREA around real controls, before any overlay on this branch uses it.
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'

import { SCROLL_AREA } from '#shared/classes.js'
import { Button } from '#components/button/index.js'

/** A body like an overlay's: a fixed height, padding of its own, and more controls than fit in it. */
const BODY: CSSProperties = { height: 200, width: 280, padding: 20, display: 'grid', gap: 12 }

function Fixture() {
  return (
    <div id="scroll-area-fixture">
      <button type="button" id="before">Before</button>
      <div id="area" className={SCROLL_AREA} style={BODY}>
        {Array.from({ length: 12 }, (_, index) => <Button key={index} variant="outline">Field {index + 1}</Button>)}
      </div>
      <button type="button" id="after">After</button>
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
