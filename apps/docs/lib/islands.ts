// The lazy islands' bookkeeping (components/lazy-island.tsx): which ones have server HTML to keep, and the part each loads.
import { type ComponentType, type LazyExoticComponent, lazy } from 'react'

/** What an island loads: its part's chunk, then the part. */
export type Load<P> = () => Promise<ComponentType<P>>

/** What the box index reads of a page: the document, or a stand-in in a test. */
export interface BoxLike {
  readonly isConnected: boolean
  getAttribute: (name: string) => string | null
  hasAttribute: (name: string) => boolean
}

export interface PageLike {
  readonly readyState: string
  querySelectorAll: (selector: string) => Iterable<BoxLike>
}

/** Whether an island still has the server's HTML in the page, from one read of every box instead of a search of the page per island.
 * An island that mounts after the page has parsed (a fresh render, a client navigation) has an id the server never wrote, so it is never in the index. */
export function createServerBoxes(page: PageLike): (id: string) => boolean {
  let boxes: Map<string, BoxLike> | null = null
  return (id) => {
    let index = boxes
    if (index === null) {
      index = new Map()
      for (const box of page.querySelectorAll('[data-island]')) index.set(box.getAttribute('data-island') ?? '', box)
      // While the page still streams in, an island further down is not parsed yet, so the index is kept only once parsing has ended.
      if (page.readyState !== 'loading') boxes = index
    }
    const box = index.get(id)
    return box !== undefined && box.isConnected && !box.hasAttribute('data-island-mounted')
  }
}

const clientParts = new WeakMap<object, unknown>()

/** One lazy part per loader for the islands that mount with no server HTML to keep. A render that suspends where React cannot wait (a transition
 * past its five seconds renders without yielding) is thrown away and the island mounts again: a lazy made per mount would suspend every time. */
export function clientPartOf<P>(load: Load<P>): LazyExoticComponent<ComponentType<P>> {
  const known = clientParts.get(load) as LazyExoticComponent<ComponentType<P>> | undefined
  if (known !== undefined) return known
  const part = lazy(() => load().then((Component) => ({ default: Component }), (error: unknown) => {
    // A chunk that failed is fetched again by the next island that mounts.
    clientParts.delete(load)
    throw error
  }))
  clientParts.set(load, part)
  return part
}
