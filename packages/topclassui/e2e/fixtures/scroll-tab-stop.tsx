// Loaded into a live page by e2e/scroll-tab-stop.spec.ts: the hook on real boxes, before any demo holds one.
import { type CSSProperties, type ReactNode, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'

import { useScrollTabStop } from '#shared/use-scroll-tab-stop.js'

/** A scroll container five rows tall: the rows are 24 px each, so the sixth one overflows it. */
const BOX: CSSProperties = { height: 120, width: 240, overflow: 'auto', margin: 0 }
const ROW: CSSProperties = { height: 24, margin: 0 }

const rows = (count: number) => Array.from({ length: count }, (_, index) => <p key={index} style={ROW}>Row {index + 1}</p>)

function Region({ id, children }: { id: string, children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  return <div ref={ref} id={id} role="region" aria-label={id} tabIndex={useScrollTabStop(ref)} style={BOX}>{children}</div>
}

function Fixture() {
  const root = useRef<HTMLDivElement>(null)
  // The spec waits for this: the effects of the regions, which are children, have run by now.
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return (
    <div ref={root} id="scroll-fixture">
      <button type="button" id="before">Before</button>
      <Region id="tall">{rows(12)}</Region>
      <Region id="short">{rows(2)}</Region>
      <Region id="wide"><p style={{ ...ROW, width: 600 }}>One row, wider than its box</p></Region>
      <Region id="grows">{rows(2)}</Region>
      <Region id="nested"><div><p id="inner" style={ROW}>One row</p></div></Region>
      <Region id="text">A few words</Region>
      <button type="button" id="after">After</button>
      {/* The same box as #tall with no hook, which is what axe reports. */}
      <div id="bare" role="region" aria-label="bare" style={BOX}>{rows(12)}</div>
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
