'use client'

// A client part that keeps the server's HTML until it comes within one viewport, then loads its own chunk and hydrates in place (S8).
import { Activity, type ComponentType, type ReactNode, Suspense, lazy, useEffect, useId, useRef, useState } from 'react'

type Load<P> = () => Promise<ComponentType<P>>

export type IslandWhen = 'near' | 'idle'

const EAGER = ['pointerover', 'focusin', 'touchstart'] as const

function gate(): { promise: Promise<void>; open: () => void } {
  let open: () => void = () => undefined
  const promise = new Promise<void>((resolve) => { open = resolve })
  return { promise, open }
}

/** True while the server's HTML for this island is in the page and nothing has hydrated it: a client navigation mounts with no HTML to keep, so it loads at once. */
function hasServerHtml(id: string): boolean {
  if (typeof document === 'undefined') return false
  const box = document.querySelector(`[data-island="${id}"]`)
  return box !== null && !box.hasAttribute('data-island-live')
}

export interface LazyIslandProps<P> {
  load: Load<P>
  props: P
  /** `near` waits for the viewport; `idle` waits for the first paint and an idle moment, for a part that is on screen from the start. */
  when?: IslandWhen
}

export function LazyIsland<P extends object>({ load, props, when = 'near' }: LazyIslandProps<P>): ReactNode {
  const id = useId()
  const box = useRef<HTMLDivElement>(null)
  // Created once: an island never renders again while it waits, or React would drop the server HTML it is keeping.
  const [island] = useState(() => {
    const { promise, open } = gate()
    const waits = hasServerHtml(id)
    const state: { open: () => void; waits: boolean; live: boolean; onLive: () => void } = { open, waits, live: !waits, onLive: () => undefined }
    const Island = lazy(async () => {
      if (waits) await promise
      const Loaded = await load()
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
    element.setAttribute('data-island-live', '')
    const open = () => { island.state.open() }
    for (const type of EAGER) element.addEventListener(type, open, { once: true, passive: true })
    // A press or a hover that lands before the chunk does is held, then given again once the island has hydrated; a link still navigates at once.
    let pressed: HTMLElement | null = null
    let hovered: Element | null = null
    const hold = (event: MouseEvent) => {
      if (island.state.live || !(event.target instanceof HTMLElement) || event.target.closest('a[href]') !== null) return
      event.preventDefault()
      event.stopPropagation()
      pressed = event.target
      open()
    }
    const over = (event: PointerEvent) => { if (!island.state.live && event.target instanceof Element) hovered = event.target }
    const out = () => { hovered = null }
    element.addEventListener('click', hold, true)
    element.addEventListener('pointerover', over, true)
    element.addEventListener('pointerout', out, true)
    island.state.onLive = () => {
      if (hovered?.isConnected === true) {
        hovered.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }))
        hovered.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
        hovered.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))
      }
      if (pressed?.isConnected === true) pressed.click()
      pressed = null
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
  }, [island, when])

  // Activity, not Suspense, around the server's HTML: a large Suspense boundary is streamed out of order and shown late, while Activity stays inline and keeps its HTML while the chunk waits.
  return (
    <div ref={box} data-island={id} className="contents">
      <Activity mode="visible">
        {island.state.waits || typeof window === 'undefined'
          ? <island.Island {...props} />
          : <Suspense fallback={null}><island.Island {...props} /></Suspense>}
      </Activity>
    </div>
  )
}

/** A client component that renders `load`'s component through a LazyIsland: the wrapper is all a page's bundle holds of it. */
export function island<P extends object>(load: Load<P>, when: IslandWhen = 'near'): (props: P) => ReactNode {
  return function Island(props: P) {
    return <LazyIsland load={load} props={props} when={when} />
  }
}
