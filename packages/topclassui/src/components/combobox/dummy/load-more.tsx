'use client'

import { useCallback, useState } from 'react'

import { Combobox } from '../index.js'

const PAGE = 50
const LAST = 4

/** One page of the server's answer, made here so the demo needs no network. */
function pageOf(page: number) {
  return Array.from({ length: PAGE }, (_, index) => {
    const n = page * PAGE + index + 1
    return { value: `r${String(n)}`, label: `Result ${String(n)}` }
  })
}

/** The component asks and never fetches: loadMore is called once per page as the open list nears its end, and the
 * page holds what has arrived. Four pages of fifty, each after a short wait. */
export default function Demo() {
  const [items, setItems] = useState(() => pageOf(0))
  const [asked, setAsked] = useState(0)
  const [loading, setLoading] = useState(false)
  const pages = items.length / PAGE

  const loadMore = useCallback(() => {
    setAsked((n) => n + 1)
    setLoading(true)
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setItems((current) => [...current, ...pageOf(current.length / PAGE)])
        setLoading(false)
        resolve()
      }, 300)
    })
  }, [])

  return (
    <div className="grid justify-items-start gap-1">
      <label htmlFor="combobox-load-more" className="text-sm font-medium text-body">Search results</label>
      <Combobox
        id="combobox-load-more"
        items={items}
        hasMore={pages < LAST}
        loadMore={loadMore}
        status={loading ? 'loading-more' : 'idle'}
      />
      <p data-testid="asked" className="text-xs text-muted">{`Pages asked for: ${String(asked)}, loaded: ${String(pages)}`}</p>
    </div>
  )
}
