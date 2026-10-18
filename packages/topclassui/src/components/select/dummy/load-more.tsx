'use client'

import { useCallback, useState } from 'react'

import { Select } from '../index.js'

const PAGE = 20
const LAST = 4

/** One page of the server's answer, made here so the demo needs no network. */
function pageOf(page: number) {
  return Array.from({ length: PAGE }, (_, index) => {
    const n = page * PAGE + index + 1
    return { value: `r${String(n)}`, label: `Result ${String(n)}` }
  })
}

/** The Select asks and never fetches: loadMore is called once per page as the open list nears its end. A client
 * island, since the demo holds the pages; a server page passes a Server Action instead. Four pages of twenty. */
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
    <div className="grid justify-items-start gap-1.5">
      <label htmlFor="select-load-more" className="text-sm text-body">Search results</label>
      <Select id="select-load-more" items={items} hasMore={pages < LAST} loadMore={loadMore} />
      <p data-testid="asked" className="text-xs text-muted">{`Pages asked for: ${String(asked)}, loaded: ${String(pages)}`}</p>
    </div>
  )
}
