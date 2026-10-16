import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import { useCollection } from './use-collection.js'

// The server measures nothing: the window must still fill the rows the box is drawn to show, or they stay blank until hydration.
const ITEMS = Array.from({ length: 10_000 }, (_, index) => `row ${String(index)}`)

function List({ visibleRows }: { visibleRows?: number }) {
  const { rows } = useCollection({ items: ITEMS, getKey: (item) => item, virtualize: true, estimateRowHeight: 40, visibleRows })
  return <ul>{rows.map((row) => <li key={row.key}>{row.item}</li>)}</ul>
}

const count = (html: string) => [...html.matchAll(/<li>/g)].length

describe('the window before anything is measured', () => {
  it('covers visibleRows, plus the row it cuts and the overscan of 6, from the top', () => {
    const html = markup(<List visibleRows={12} />)
    expect(count(html)).toBe(19)
    expect(html.startsWith('<ul><li>row 0</li>')).toBe(true)
  })

  it('covers the provider default of 7 rows when visibleRows is left out', () => {
    expect(count(markup(<List />))).toBe(14)
  })
})
