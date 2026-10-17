// Loaded into a live page by e2e/tag-remove.spec.ts: removable tags in the layouts and with the content no demo
// should show. Mounted in a provider of the page's own direction and locale, as the harness mounts a demo.
// Inline styles only: the stylesheet of a live page is compiled from src/, so a class written here alone would not exist.
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Tag } from '#components/tag/index.js'

declare global {
  interface Window { __tagRemoved?: string[] }
}

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const WORD = 'W'.repeat(300)
const SIXTY = Array.from({ length: 60 }, (_, index) => `Topic ${String(index + 1)}`)

/** Every call of every onRemove, in order, so a spec counts them. */
const calls: string[] = []
window.__tagRemoved = calls
const record = (name: string) => () => { calls.push(name) }

const SECTION: CSSProperties = { marginBlock: 24 }
const SIDE: CSSProperties = { width: 96, flex: 'none' }

function Section({ id, children }: { id: string, children: ReactNode }) {
  return <section id={id} style={SECTION}>{children}</section>
}

/** The caller removes the tag and does nothing about the focus: the spec measures where it lands. */
function Unmanaged() {
  const [topics, setTopics] = useState(['Alpha', 'Beta', 'Gamma'])
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {topics.map((topic) => (
        <Tag key={topic} onRemove={() => { setTopics(topics.filter((other) => other !== topic)) }}>{topic}</Tag>
      ))}
    </div>
  )
}

function Fixture() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return (
    <div ref={root} id="tag-fixture">
      <Section id="sizes">
        {SIZES.map((size) => (
          <div key={size} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 8, marginBlock: 8 }}>
            <Tag id={`plain-${size}`} size={size}>Plain</Tag>
            <Tag id={`size-${size}`} size={size} onRemove={record(size)}>Removable</Tag>
          </div>
        ))}
        <Tag id="size-custom" size="custom" onRemove={record('custom')}>Custom</Tag>
      </Section>
      <Section id="word"><Tag id="word-tag" onRemove={record('word')}>{WORD}</Tag></Section>
      <Section id="element">
        <Tag id="element-tag" onRemove={record('element')}><strong>{WORD}</strong></Tag>
      </Section>
      <Section id="sixty">
        <div id="sixty-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: 320, maxWidth: '100%' }}>
          {SIXTY.map((topic) => <Tag key={topic} onRemove={record(topic)}>{topic}</Tag>)}
        </div>
      </Section>
      <Section id="grid">
        <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 8 }}>
          <div>Side</div>
          <Tag id="grid-tag" onRemove={record('grid')}>{WORD}</Tag>
        </div>
      </Section>
      <Section id="flex">
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={SIDE}>Side</div>
          <div style={{ flex: 1 }}><Tag id="flex-tag" onRemove={record('flex')}>{WORD}</Tag></div>
        </div>
      </Section>
      <Section id="fit">
        <div style={{ width: 'fit-content' }}><Tag id="fit-tag" onRemove={record('fit')}>{WORD}</Tag></div>
        <div style={{ width: 'fit-content' }}><Tag id="fit-short" onRemove={record('fit short')}>Short</Tag></div>
      </Section>
      <Section id="cell">
        <table>
          <tbody><tr><td>Side</td><td><Tag id="cell-tag" onRemove={record('cell')}>{WORD}</Tag></td></tr></tbody>
        </table>
      </Section>
      <Section id="unmanaged"><Unmanaged /></Section>
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
createRoot(container).render(
  <TopClassProvider direction={direction} locale={document.documentElement.lang}><Fixture /></TopClassProvider>,
)
