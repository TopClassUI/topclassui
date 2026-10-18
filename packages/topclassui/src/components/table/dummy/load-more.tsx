'use client'

import { useCallback, useState } from 'react'

import { Table } from '../index.js'

const PAGE = 20
const LAST = 4

/** One page of the server's answer, made here so the demo needs no network. */
function pageOf(page: number) {
  return Array.from({ length: PAGE }, (_, index) => {
    const n = page * PAGE + index + 1
    return { id: `o${String(n)}`, n }
  })
}

/** The table asks and never fetches: loadMore is called once per page as the box nears its end. A client island,
 * since the demo holds the pages; a server page passes a Server Action and renders the rows it was given. */
export default function Demo() {
  const [items, setItems] = useState(() => pageOf(0))
  const [asked, setAsked] = useState(0)
  const pages = items.length / PAGE

  const loadMore = useCallback(() => {
    setAsked((n) => n + 1)
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setItems((current) => [...current, ...pageOf(current.length / PAGE)])
        resolve()
      }, 300)
    })
  }, [])

  return (
    <div className="grid gap-1.5">
      <Table
        caption="Orders, page by page"
        items={items}
        getKey={(order) => order.id}
        hasMore={pages < LAST}
        loadMore={loadMore}
        columns={[
          { key: 'n', header: 'Order', rowHeader: true, cell: (order) => `Order ${String(order.n)}` },
          { key: 'total', header: 'Total', align: 'end', cell: (order) => `$${String(order.n * 12)}.00` },
        ]}
      />
      <p data-testid="asked" className="text-xs text-muted">{`Pages asked for: ${String(asked)}, loaded: ${String(pages)}`}</p>
    </div>
  )
}
