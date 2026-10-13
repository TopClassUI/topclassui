// Loaded into a live page by e2e/accordion.spec.ts: what no demo may hold. The default heading level, first, so it
// follows the h1 of the page; an accordion inside four real layouts; a title that holds a link (invalid HTML);
// an empty title; an item its caller filled; and hiddenUntilFound={false}.
import { type CSSProperties, type ReactNode, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'

import { AccordionItem, AccordionRoot } from '#components/accordion/index.js'

const NOWRAP: CSSProperties = { whiteSpace: 'nowrap', paddingInlineEnd: 24 }
const COLUMNS = ['Order', 'Customer', 'Placed', 'Status', 'Items', 'Total', 'Warehouse', 'Carrier']
const ORDER = ['ORD-5521', 'Northwind Traders', '12 March 2026', 'Awaiting payment', '14', '$1,250.00', 'Amman, building 4', 'Aramex']

/** An accordion whose open panel holds a table some 800 px wide: the widest thing a layout has to survive. */
function Wide({ name }: { name: string }) {
  return (
    <AccordionRoot defaultValue={['orders']}>
      <AccordionItem value="orders" title={`Orders in ${name}`} headingLevel={2}>
        <table>
          <thead><tr>{COLUMNS.map((column) => <th key={column} scope="col" style={NOWRAP}>{column}</th>)}</tr></thead>
          <tbody><tr>{ORDER.map((cell) => <td key={cell} style={NOWRAP}>{cell}</td>)}</tr></tbody>
        </table>
      </AccordionItem>
      <AccordionItem value="notes" title="Notes" headingLevel={2}>Nothing yet.</AccordionItem>
    </AccordionRoot>
  )
}

function Case({ id, style, children }: { id: string, style?: CSSProperties, children: ReactNode }) {
  return <section id={id} style={{ marginBlockEnd: 24, ...style }}>{children}</section>
}

function Fixture() {
  const root = useRef<HTMLDivElement>(null)
  // The spec waits for this: the effects of every accordion, which are children, have run by now.
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return (
    <div ref={root} id="accordion-fixture" style={{ padding: 16 }}>
      <Case id="default-level">
        <AccordionRoot>
          <AccordionItem value="one" title="No level passed">An h3, as Base UI renders it.</AccordionItem>
        </AccordionRoot>
      </Case>
      <Case id="in-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Wide name="a grid track" />
        <p>The second track.</p>
      </Case>
      <Case id="in-flex" style={{ display: 'flex', gap: 16 }}>
        <p style={{ width: 60, flexShrink: 0 }}>A side column.</p>
        <div data-column style={{ flex: 1 }}><Wide name="a flex column" /></div>
      </Case>
      <Case id="in-fit" style={{ width: 'fit-content' }}>
        <Wide name="a parent that fits its content" />
      </Case>
      <Case id="in-cell">
        <table><tbody><tr><td><Wide name="a table cell" /></td></tr></tbody></table>
      </Case>
      <Case id="link-title">
        <AccordionRoot>
          <AccordionItem value="one" headingLevel={2} title={<>Read <a id="title-link" href="#link-title">the terms</a> first</>}>
            The terms.
          </AccordionItem>
        </AccordionRoot>
      </Case>
      <Case id="empty-title">
        <AccordionRoot>
          <AccordionItem value="" headingLevel={2} title="" />
        </AccordionRoot>
      </Case>
      <Case id="filled">
        <AccordionRoot>
          <AccordionItem value="one" headingLevel={2} title="A fill from its caller" className="bg-neutral-solid">Text</AccordionItem>
        </AccordionRoot>
      </Case>
      <Case id="not-kept">
        <AccordionRoot hiddenUntilFound={false} defaultValue={['open']}>
          <AccordionItem value="open" title="Open from the start" headingLevel={2}>Shown.</AccordionItem>
          <AccordionItem value="closed" title="Closed from the start" headingLevel={2}>Not in the page until it opens.</AccordionItem>
        </AccordionRoot>
      </Case>
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
