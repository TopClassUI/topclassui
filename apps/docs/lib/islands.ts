// The lazy islands' bookkeeping (components/lazy-island.tsx): which ones have server HTML to keep, the part each loads, and whose turn it is to take over.
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

export interface Turn {
  /** Lower goes first; read when a turn is chosen, so an input that lands while the island waits moves it up. */
  readonly rank: number
  /** Starts the island's fresh render, and calls `end` once it has committed, or at once if the island is gone. */
  swap: (end: () => void) => void
}

export interface TurnClock {
  /** Calls `next` once the browser has painted the frame after the call. */
  afterPaint: (next: () => void) => void
  /** Calls `next` after `ms`. */
  later: (next: () => void, ms: number) => void
}

/** Islands take over one at a time, each after the frame the last one painted in, so a section that scrolls in is a run of short tasks rather
 * than one commit of every island in it. A turn that has not ended after `limit` ms (a nested chunk still on the network) lets the next one go. */
export function createTurns(clock: TurnClock, limit: number): (turn: Turn) => void {
  const waiting: Turn[] = []
  let running = false
  const next = (): void => {
    let turn: Turn | undefined
    for (const waiter of waiting) if (turn === undefined || waiter.rank < turn.rank) turn = waiter
    if (turn === undefined) {
      running = false
      return
    }
    waiting.splice(waiting.indexOf(turn), 1)
    running = true
    let ended = false
    const end = () => {
      if (ended) return
      ended = true
      clock.afterPaint(next)
    }
    clock.later(end, limit)
    turn.swap(end)
  }
  return (turn) => {
    waiting.push(turn)
    if (!running) next()
  }
}

/** An input on the island, or a part on screen from the start: it goes before every island that only came near. */
export const FIRST = -Infinity

/** The rank of an island that came near the screen in the `round`-th report: the latest report first, since that is where the reader is now,
 * and in one report the island nearest the screen first. `top` and `bottom` are its box against a screen `screen` px tall. */
export function rankNear(round: number, top: number, bottom: number, screen: number): number {
  const distance = top > screen ? top - screen : bottom < 0 ? -bottom : 0
  return -round * 1e6 + Math.min(distance, 999_999)
}
