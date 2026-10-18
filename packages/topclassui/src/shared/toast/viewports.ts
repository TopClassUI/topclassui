/** The viewports mounted on the page, first come first served. Each root of an app with two React roots
 * mounts a TopClassProvider, and each provider a viewport: only the first draws, so a page has one live region. */
const mounted: symbol[] = []
const listeners = new Set<() => void>()
const notify = () => { for (const listener of listeners) listener() }

/** Registers a viewport and returns the call that removes it, for an effect to return. */
export function claimViewport(key: symbol): () => void {
  mounted.push(key)
  notify()
  return () => {
    const at = mounted.indexOf(key)
    if (at !== -1) mounted.splice(at, 1)
    notify()
  }
}

/** The viewport that draws: the first one mounted, or none yet. */
export const drawingViewport = (): symbol | undefined => mounted[0]

export function subscribeViewports(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}
