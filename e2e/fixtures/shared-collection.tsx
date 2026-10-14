// Loaded into a live page by e2e/shared-collection.spec.ts: the list of a Combobox in miniature, before any control holds it.
// Ten thousand rows of 40 px, no gap, the list's own 6 px padding, the shared scroll area, and the two spacers as
// pseudo-elements that read --tc-list-pad-start and --tc-list-pad-end. A sheet, since the harness compiles only src/.
import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import { SCROLL_AREA } from '#shared/classes.js'
import { useCollection } from '#shared/collection/use-collection.js'

declare global { interface Window { collectionFixture?: { scrollToIndex: (index: number) => void } } }

const ITEMS = Array.from({ length: 10_000 }, (_, index) => `Option ${String(index)}`)
const getKey = (item: string) => item

const SHEET = `
#collection-list { display: flex; flex-direction: column; box-sizing: border-box; width: 240px; height: 292px; padding: 6px; border: 1px solid; }
#collection-list::before { content: ''; flex-shrink: 0; height: var(--tc-list-pad-start); }
#collection-list::after { content: ''; flex-shrink: 0; height: var(--tc-list-pad-end); }
#collection-list [data-row] { flex-shrink: 0; height: 40px; display: flex; align-items: center; }
`

function List() {
  const collection = useCollection({ items: ITEMS, getKey, estimateRowHeight: 40 })
  const { scrollToIndex } = collection
  useEffect(() => { window.collectionFixture = { scrollToIndex } }, [scrollToIndex])
  return (
    <div
      id="collection-list" role="listbox" aria-label="Options" className={SCROLL_AREA} ref={collection.scrollRef}
      style={{ '--tc-list-pad-start': `${String(collection.paddingStart)}px`, '--tc-list-pad-end': `${String(collection.paddingEnd)}px` }}
    >
      {collection.rows.map((row) => (
        <div key={row.key} ref={collection.rowRef(row.index)} role="option" aria-selected={false} data-row={row.index}>{row.item}</div>
      ))}
    </div>
  )
}

function Fixture() {
  return (
    <div id="collection-fixture" style={{ padding: 16 }}>
      <style>{SHEET}</style>
      <List />
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
