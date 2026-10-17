// Loaded into a live page by e2e/rating.spec.ts: what no demo may hold. Ten xl stars inside four real layouts,
// read-only and editing; a rating that counts its onValueChange calls; and hostile values the clamp must survive.
// Inline styles, since the harness compiles only the classes it finds under src/.
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { Rating } from '#components/rating/index.js'

const CASE: CSSProperties = { marginBlockEnd: 24 }

function Both({ name }: { name: string }) {
  return (
    <>
      <Rating max={10} size="xl" value={7.5} data-layout={name} />
      <Rating readOnly={false} max={10} size="xl" defaultValue={6} aria-label={name} data-layout={name} />
    </>
  )
}

function Case({ id, style, children }: { id: string, style?: CSSProperties, children: ReactNode }) {
  return <section id={id} style={{ ...CASE, ...style }}>{children}</section>
}

/** Counts every call, so a spec can tell one call from two. */
function Counting() {
  const [calls, setCalls] = useState([] as number[])
  return (
    <div id="counting" data-calls={calls.join(',')}>
      <Rating readOnly={false} aria-label="Counted" onValueChange={(next) => { setCalls((all) => [...all, next]) }} />
    </div>
  )
}

function Fixture() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return (
    <div ref={root} id="rating-fixture" style={{ padding: 16 }}>
      <Case id="in-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div><Both name="grid" /></div>
        <p>The second track.</p>
      </Case>
      <Case id="in-flex" style={{ display: 'flex', gap: 16 }}>
        <p style={{ width: 60, flexShrink: 0 }}>A side column.</p>
        <div style={{ flex: 1 }}><Both name="flex" /></div>
      </Case>
      <Case id="in-fit" style={{ width: 'fit-content' }}>
        <Both name="fit" />
      </Case>
      <Case id="in-cell">
        <table><tbody><tr><td>A label</td><td><Both name="cell" /></td></tr></tbody></table>
      </Case>
      <Case id="counting-case"><Counting /></Case>
      <Case id="hostile">
        <Rating value={Number.NaN} data-hostile="nan" />
        <Rating value={-3} data-hostile="negative" />
        <Rating value={99} data-hostile="over" />
        <Rating value={4} max={1000} data-hostile="many" />
        <Rating value={1} max={0} data-hostile="none" />
        <Rating readOnly={false} defaultValue={2.6} max={3.4} aria-label="Rounded" data-hostile="rounded" />
      </Case>
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
