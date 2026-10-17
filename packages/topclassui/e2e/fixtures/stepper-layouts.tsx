// Loaded into a live page by e2e/stepper.spec.ts: a stepper where a real page puts one (U3-BUILD.md, "Measure"). Alone
// as a grid item, in a wrapper in a grid track, in a flex-1 column, in a w-fit parent and in a table cell; then hostile
// content: a 300-character word, an element where text is expected, an empty title, an error step being fixed, twelve
// steps and sixty steps.
// Inline styles: the harness compiles only classes under src/.
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'

import { Stepper } from '#components/stepper/index.js'

// minmax(0, 1fr): one case asking for more room must not widen the column every other case is measured in.
const PAGE: CSSProperties = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 24, padding: 16, alignContent: 'start' }
const CELL: CSSProperties = { border: '1px solid GrayText', padding: 8 }
const PAIR: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }
const WORD = 'Supercalifragilistic'.repeat(15)

const FOUR = [
  { id: 'a', title: 'Account' },
  { id: 'b', title: 'Profile' },
  { id: 'c', title: 'Team' },
  { id: 'd', title: 'Done' },
]
const many = (count: number) => Array.from({ length: count }, (_, at) => ({ id: `s${String(at)}`, title: `Step ${String(at + 1)}` }))

function Fixture() {
  return (
    <div id="layouts" style={PAGE}>
      <div data-case="grid" style={{ display: 'grid' }}><Stepper items={FOUR} value="b" aria-label="In a grid" /></div>
      <div data-case="track" style={PAIR}><div><Stepper items={FOUR} value="b" aria-label="In a grid track" /></div><span>Beside</span></div>
      <div data-case="flex-1" style={{ display: 'flex', gap: 8 }}>
        <span style={{ width: 80, flex: 'none' }}>Side</span>
        <div style={{ flex: 1, minWidth: 0 }}><Stepper items={FOUR} value="b" aria-label="In a flex-1 column" /></div>
      </div>
      <div data-case="w-fit" style={{ width: 'fit-content' }}><Stepper items={FOUR} value="b" aria-label="In a w-fit parent" /></div>
      <table data-case="cell" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <tbody><tr><td style={CELL}>Progress</td><td style={CELL}><Stepper items={FOUR} value="b" aria-label="In a table cell" /></td></tr></tbody>
      </table>
      <div data-case="word"><Stepper items={[{ id: 'w', title: WORD }, ...FOUR]} value="b" aria-label="A long word" /></div>
      <div data-case="word-w-fit" style={{ width: 'fit-content' }}>
        <Stepper items={[{ id: 'w', title: WORD }, ...FOUR]} value="b" aria-label="A long word, w-fit" />
      </div>
      <div data-case="element">
        <Stepper
          items={[{ id: 'e', title: <strong>Bold <em>and</em> nested</strong> }, { id: 'f', title: <div>A block</div> }, { id: 'g', title: '' }]}
          value="f"
          aria-label="Elements and an empty title"
        />
      </div>
      <div data-case="fixing">
        <Stepper items={FOUR.map((step) => (step.id === 'b' ? { ...step, status: 'error' as const } : step))} value="b" aria-label="Fixing a step" />
      </div>
      <div data-case="twelve"><Stepper items={many(12)} value="s5" aria-label="Twelve steps" /></div>
      <div data-case="sixty"><Stepper items={many(60)} value="s30" aria-label="Sixty steps" /></div>
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
