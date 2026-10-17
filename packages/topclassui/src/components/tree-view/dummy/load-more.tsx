'use client'

import { useCallback, useState } from 'react'

import { TreeView } from '../index.js'

const PAGE = 20
const LAST = 4

/** One page of the server's answer, made here so the demo needs no network: folders of two files each. */
function pageOf(page: number) {
  return Array.from({ length: PAGE }, (_, index) => {
    const n = page * PAGE + index + 1
    return {
      id: `d${String(n)}`,
      label: `Folder ${String(n)}`,
      children: [{ id: `d${String(n)}-a`, label: `a-${String(n)}.ts` }, { id: `d${String(n)}-b`, label: `b-${String(n)}.ts` }],
    }
  })
}

/** The tree asks and never fetches: loadMore is called once per page of root folders as the tree nears its end, and
 * the page holds what has arrived. Four pages of twenty, each after a short wait. */
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
    <div className="grid gap-1">
      <span id="tree-view-load-more" className="text-sm font-medium text-body">Repository</span>
      <TreeView
        aria-labelledby="tree-view-load-more"
        items={items}
        hasMore={pages < LAST}
        loadMore={loadMore}
        status={loading ? 'loading-more' : 'idle'}
      />
      <p data-testid="asked" className="text-xs text-muted">{`Pages asked for: ${String(asked)}, loaded: ${String(pages)}`}</p>
    </div>
  )
}
