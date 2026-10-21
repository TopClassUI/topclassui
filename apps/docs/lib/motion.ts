// The scripted half of the site's motion: blocks below the fold wait, then play once as they scroll in. The CSS does the moving.

/** True when the browser ties a reveal to the scroll itself, so the watcher leaves those blocks to the CSS. */
function revealsInCss(): boolean {
  return typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()') && matchMedia('(prefers-reduced-motion: no-preference)').matches
}

/** Holds each [data-motion] block that starts below the viewport and plays it once when it scrolls in; returns the cleanup. */
export function armMotion(doc: Document): () => void {
  const view = doc.defaultView
  if (view === null || typeof IntersectionObserver === 'undefined') return () => undefined
  if (getComputedStyle(doc.documentElement).getPropertyValue('--tc-motion').trim() === '0') return () => undefined
  const skipReveal = revealsInCss()
  const play = (element: Element) => {
    element.removeAttribute('data-motion-wait')
    element.setAttribute('data-motion-play', '')
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      play(entry.target)
      observer.unobserve(entry.target)
    }
  }, { rootMargin: '0px 0px -10% 0px' })
  const candidates = [...doc.querySelectorAll<HTMLElement>('[data-motion]')]
    .filter((element) => !(skipReveal && element.dataset['motion'] === 'reveal') && !element.hasAttribute('data-motion-play'))
  // Every read before any write: a write between two reads lays the page out again (a forced reflow).
  const below = candidates.filter((element) => element.getBoundingClientRect().top >= view.innerHeight)
  const held: Element[] = []
  for (const element of below) {
    for (const run of element.querySelectorAll<HTMLElement>('[data-count]')) run.style.setProperty('--docs-count-to', run.dataset['count'] ?? '0')
    element.setAttribute('data-motion-wait', '')
    held.push(element)
    observer.observe(element)
  }
  return () => {
    observer.disconnect()
    for (const element of held) element.removeAttribute('data-motion-wait')
  }
}
