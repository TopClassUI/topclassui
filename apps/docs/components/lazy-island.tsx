'use client'

// A client part that keeps the server's HTML until it comes within one viewport, then loads its own chunk and takes over in place (S8).
import { Activity, type ComponentType, type ReactNode, lazy, startTransition, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'

type Load<P> = () => Promise<ComponentType<P>>

export type IslandWhen = 'near' | 'idle'

const EAGER = ['pointerover', 'focusin', 'touchstart'] as const

/** True while the server's HTML for this island is in the page and nothing has taken it over: a client navigation mounts with no HTML to keep, so it loads at once. */
function hasServerHtml(id: string): boolean {
  if (typeof document === 'undefined') return false
  const box = document.querySelector(`[data-island="${id}"]`)
  return box !== null && !box.hasAttribute('data-island-live')
}

/** Where a node sits under the box, as child indexes, so the same place can be found in a fresh render. */
function pathOf(box: Element, node: Element): number[] | null {
  const path: number[] = []
  let at = node
  while (at !== box) {
    const parent = at.parentElement
    if (parent === null) return null
    path.unshift(Array.prototype.indexOf.call(parent.children, at))
    at = parent
  }
  return path
}

function nodeAt(box: Element, path: number[] | null): HTMLElement | null {
  if (path === null) return null
  let at: Element | undefined = box
  for (const index of path) at = at?.children[index]
  return at instanceof HTMLElement ? at : null
}

export interface LazyIslandProps<P> {
  load: Load<P>
  props: P
  /** `near` waits for the viewport; `idle` waits for the first paint and an idle moment, for a part that is on screen from the start. */
  when?: IslandWhen
  /** true hydrates the server's HTML in place (the root provider, whose page must keep its DOM); otherwise the part renders afresh in its place, since a Base UI part hydrated late can lose its updates. */
  hydrate?: boolean
}

interface Held {
  pressed: number[] | null
  hovered: number[] | null
  focused: number[] | null
}

export function LazyIsland<P extends object>({ load, props, when = 'near', hydrate = false }: LazyIslandProps<P>): ReactNode {
  const id = useId()
  const box = useRef<HTMLDivElement>(null)
  const held = useRef<Held>({ pressed: null, hovered: null, focused: null })
  const [fresh, setFresh] = useState<{ Component: ComponentType<P> } | null>(null)
  // Created once: an island never renders again while it waits, or React would drop the server HTML it is keeping.
  const [island] = useState(() => {
    let open: () => void = () => undefined
    const gate = new Promise<void>((resolve) => { open = resolve })
    const waits = hasServerHtml(id)
    const state = { open, gate, waits, live: !waits, onLive: () => undefined as unknown }
    const Island = lazy(async () => {
      if (waits) await gate
      const Loaded = await load()
      if (!hydrate) return { default: Loaded }
      return {
        default: function Hydrated(loadedProps: P) {
          useEffect(() => {
            state.live = true
            state.onLive()
          }, [])
          return <Loaded {...loadedProps} />
        },
      }
    })
    return { Island, state }
  })

  useEffect(() => {
    const element = box.current
    if (element === null) return
    const { state } = island
    element.setAttribute('data-island-live', '')
    const open = () => { state.open() }
    for (const type of EAGER) element.addEventListener(type, open, { once: true, passive: true })
    // A press or a hover that lands before the chunk does is held, then given again once the island has taken over; a link still navigates at once.
    const hold = (event: MouseEvent) => {
      if (state.live || !(event.target instanceof HTMLElement) || event.target.closest('a[href]') !== null) return
      event.preventDefault()
      event.stopPropagation()
      held.current.pressed = pathOf(element, event.target)
      open()
    }
    const over = (event: PointerEvent) => { if (!state.live && event.target instanceof Element) held.current.hovered = pathOf(element, event.target) }
    const out = () => { held.current.hovered = null }
    element.addEventListener('click', hold, true)
    element.addEventListener('pointerover', over, true)
    element.addEventListener('pointerout', out, true)
    state.onLive = () => {
      const hovered = nodeAt(element, held.current.hovered)
      if (hovered !== null) {
        hovered.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }))
        hovered.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
        hovered.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))
      }
      nodeAt(element, held.current.pressed)?.click()
      held.current = { pressed: null, hovered: null, focused: null }
    }
    if (state.waits && !hydrate) {
      void state.gate.then(load).then((Component) => {
        const focused = document.activeElement
        held.current.focused = focused !== null && element.contains(focused) ? pathOf(element, focused) : null
        // A transition keeps the server's HTML on screen until the whole fresh render, nested islands included, is ready.
        startTransition(() => { setFresh({ Component }) })
      })
    }
    let cancel: () => void = () => undefined
    if (when === 'idle') {
      // Safari has no requestIdleCallback; a timer still runs after the first paint.
      if ('requestIdleCallback' in window) {
        const handle = window.requestIdleCallback(open, { timeout: 2000 })
        cancel = () => { window.cancelIdleCallback(handle) }
      } else {
        const handle = setTimeout(open, 200)
        cancel = () => { clearTimeout(handle) }
      }
    } else {
      // display: contents gives the box no geometry, so the observer watches its first child.
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) open()
      }, { rootMargin: '100% 0px' })
      observer.observe(element.firstElementChild ?? element)
      cancel = () => { observer.disconnect() }
    }
    return () => {
      cancel()
      for (const type of EAGER) element.removeEventListener(type, open)
      element.removeEventListener('click', hold, true)
      element.removeEventListener('pointerover', over, true)
      element.removeEventListener('pointerout', out, true)
    }
  }, [island, when, hydrate, load])

  // The fresh render replaced the server's HTML in one commit: focus goes back where it was before anything paints.
  useLayoutEffect(() => {
    const element = box.current
    if (fresh === null || element === null) return
    nodeAt(element, held.current.focused)?.focus({ preventScroll: true })
    island.state.live = true
    island.state.onLive()
  }, [fresh, island])

  if (hydrate) {
    // Activity, not Suspense: a large Suspense boundary is streamed out of order and shown late, while Activity stays inline and keeps its HTML while the chunk waits.
    return (
      <div ref={box} data-island={id} className="contents">
        <Activity mode="visible"><island.Island {...props} /></Activity>
      </div>
    )
  }
  if (fresh !== null) return <div ref={box} data-island={id} className="contents"><fresh.Component {...props} /></div>
  // While it waits, the box is left to the server's HTML: React does not hydrate what an innerHTML element holds.
  if (island.state.waits) return <div ref={box} data-island={id} className="contents" dangerouslySetInnerHTML={{ __html: '' }} suppressHydrationWarning />
  return <div ref={box} data-island={id} className="contents"><island.Island {...props} /></div>
}

/** A client component that renders `load`'s component through a LazyIsland: the wrapper is all a page's bundle holds of it. */
export function island<P extends object>(load: Load<P>, when: IslandWhen = 'near', hydrate = false): (props: P) => ReactNode {
  return function Island(props: P) {
    return <LazyIsland load={load} props={props} when={when} hydrate={hydrate} />
  }
}
