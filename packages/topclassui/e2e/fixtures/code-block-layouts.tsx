// Loaded into a live page by e2e/code-block.spec.ts: a block with a 300-character line where a real page puts one, alone
// as a grid item, in a grid track of 1fr, in a flex-1 column with no min-width, in a w-fit parent and in a table cell;
// then hostile content: an element and a 300-character word as the title, an empty code, sixty lines. Inline styles only:
// the stylesheet of a live page is compiled from src/, so a class written here alone would not exist.
import { type CSSProperties, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'

import { getLabels } from '#shared/labels/get-labels.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { CodeBlock } from '#components/code-block/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
const locale = direction === 'rtl' ? 'ar' : 'en'

const PAGE: CSSProperties = { display: 'grid', gap: 24, alignContent: 'start' }
const CELL: CSSProperties = { border: '1px solid GrayText', padding: 8 }
const LINE = ["const token = '", 'a1b2c3d4e5'.repeat(28), "abcd'"].join('')
const WORD = 'W'.repeat(300)
const LINES = Array.from({ length: 60 }, (_, line) => `const line${String(line + 1)} = ${String(line + 1)}`).join('\n')

function Fixture() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  const labels = getLabels(locale)
  return (
    <div ref={root} id="code-block-fixture" style={PAGE}>
      <CodeBlock id="cb-alone" {...labels} title="alone.ts">{LINE}</CodeBlock>
      <div data-case="track" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
        <CodeBlock id="cb-track" {...labels} title="track.ts">{LINE}</CodeBlock>
        <span>Side</span>
      </div>
      <div data-case="flex-1" style={{ display: 'flex', gap: 8 }}>
        <span style={{ width: 80, flex: 'none' }}>Side</span>
        <div style={{ flex: 1 }}><CodeBlock id="cb-flex" {...labels} title="flex.ts">{LINE}</CodeBlock></div>
      </div>
      <div data-case="w-fit" style={{ width: 'fit-content' }}>
        <CodeBlock id="cb-fit" {...labels} title="fit.ts">{LINE}</CodeBlock>
      </div>
      <table data-case="cell" style={{ borderCollapse: 'collapse' }}>
        <tbody><tr><td style={CELL}>Side</td><td style={CELL}><CodeBlock id="cb-cell" {...labels} title="cell.ts">{LINE}</CodeBlock></td></tr></tbody>
      </table>
      <CodeBlock id="cb-element-title" {...labels} title={<strong>{WORD}</strong>}>{'const a = 1'}</CodeBlock>
      <CodeBlock id="cb-word-title" {...labels} title={WORD}>{'const a = 1'}</CodeBlock>
      <CodeBlock id="cb-empty" {...labels} title="empty.ts">{''}</CodeBlock>
      <CodeBlock id="cb-lines" {...labels} title="lines.ts">{LINES}</CodeBlock>
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<TopClassProvider direction={direction} locale={locale}><Fixture /></TopClassProvider>)
