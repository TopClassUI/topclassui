// The scripted half of the site's motion: blocks below the fold wait, then play once as they scroll in. The CSS does the moving.

/** True when the browser ties a reveal to the scroll itself, so the watcher leaves those blocks to the CSS. */
function revealsInCss(): boolean {
  return typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()') && matchMedia('(prefers-reduced-motion: no-preference)').matches
}

/** Whether a block starts below the screen. Inside content the browser skips (content-visibility: auto) its box reads empty, and measuring
 * it would lay that content out, so the outermost box around it that lies wholly off the screen answers, read from the root down. */
function startsBelow(entry: IntersectionObserverEntry, screen: number): boolean {
  const box = entry.boundingClientRect
  if (box.width > 0 || box.height > 0) return box.top >= screen
  const around: Element[] = []
  for (let at = entry.target.parentElement; at !== null; at = at.parentElement) around.unshift(at)
  for (const element of around) {
    const { top, bottom, width, height } = element.getBoundingClientRect()
    // A display: contents wrapper, such as an island's, has no box of its own to place.
    if (width === 0 && height === 0) continue
    if (top >= screen) return true
    if (bottom <= 0) return false
  }
  return false
}

/** Holds each [data-motion] block that starts below the viewport and plays it once when it scrolls in; returns the cleanup. */
export function armMotion(doc: Document): () => void {
  const view = doc.defaultView
  if (view === null || typeof IntersectionObserver === 'undefined') return () => undefined
  const skipReveal = revealsInCss()
  const placed = new Set<Element>()
  const held: Element[] = []
  let still: boolean | null = null
  let armed = true
  const hold = (element: Element) => {
    for (const run of element.querySelectorAll<HTMLElement>('[data-count]')) run.style.setProperty('--docs-count-to', run.dataset['count'] ?? '0')
    element.setAttribute('data-motion-wait', '')
    held.push(element)
  }
  const play = (element: Element) => {
    element.removeAttribute('data-motion-wait')
    element.setAttribute('data-motion-play', '')
  }
  // The first report of a block comes after the frame's layout, so where it starts is known without forcing one (a forced reflow).
  const observer = new IntersectionObserver((entries) => {
    if (!armed) return
    still ??= getComputedStyle(doc.documentElement).getPropertyValue('--tc-motion').trim() === '0'
    if (still) {
      observer.disconnect()
      return
    }
    // Every read before any write: a write between two reads would lay the page out again.
    const below = new Set(entries.filter((entry) => !placed.has(entry.target) && startsBelow(entry, view.innerHeight)).map((entry) => entry.target))
    for (const entry of entries) {
      const element = entry.target
      if (!placed.has(element)) {
        placed.add(element)
        if (below.has(element)) hold(element)
        else observer.unobserve(element)
      } else if (entry.isIntersecting) {
        play(element)
        observer.unobserve(element)
      }
    }
  }, { rootMargin: '0px 0px -10% 0px' })
  for (const element of doc.querySelectorAll<HTMLElement>('[data-motion]')) {
    if (!(skipReveal && element.dataset['motion'] === 'reveal') && !element.hasAttribute('data-motion-play')) observer.observe(element)
  }
  return () => {
    armed = false
    observer.disconnect()
    for (const element of held) element.removeAttribute('data-motion-wait')
  }
}
