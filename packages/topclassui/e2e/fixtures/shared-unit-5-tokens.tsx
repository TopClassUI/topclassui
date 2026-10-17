// Loaded into a live page by e2e/shared-unit-5-tokens.spec.ts: one probe per unit 5 token, since neither Meter nor
// TreeView exists yet. Each probe is a block in a 200 px track, so a value the browser refuses falls back to the track.
// Inline styles only, since the harness compiles only the classes it finds under src/.
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'

const TRACK: CSSProperties = { width: 200, display: 'grid', gap: 8, margin: 24 }
const PROBE: CSSProperties = { display: 'block', height: 8, background: 'currentColor' }

/** The indent a tree row draws: one level's width times the row's depth, as a TreeView row will write it. */
const INDENT = 'calc(var(--tc-tree-indent) * var(--tc-tree-level))'

function Fixture() {
  return (
    <div id="tokens" style={TRACK}>
      <span id="indent" style={{ ...PROBE, width: 'var(--tc-tree-indent)' }} />
      <span id="level-root" style={{ ...PROBE, width: INDENT }} />
      <span id="level-3" style={{ ...PROBE, width: INDENT, '--tc-tree-level': 3 }} />
      <span id="meter-root" style={{ ...PROBE, width: 'var(--tc-meter-value)' }} />
      <span id="meter-40" style={{ ...PROBE, width: 'var(--tc-meter-value)', '--tc-meter-value': '40%' }} />
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
