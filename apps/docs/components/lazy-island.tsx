'use client'

// A client part that keeps the server's HTML until it comes within one viewport, then loads its own chunk and takes over in place (S8).
import { Activity, type ComponentType, type ReactNode, lazy, startTransition, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'

type Load<P> = () => Promise<ComponentType<P>>

export type IslandWhen = 'near' | 'idle'

const EAGER = ['pointerover', 'focusin', 'touchstart'] as const

type Input = { kind: 'press'; target: Element } | { kind: 'key'; target: Element; init: KeyboardEventInit }

/** What each mounted island does with an input that lands in it before it has taken over. */
const claims = new Map<Element, (input: Input) => void>()
/** Inputs on an island that has not mounted yet, as under a provider still waiting for its idle moment. */
const early: Input[] = []
/** The element under the pointer, so a hover that began on the server's HTML is given again. */
let hovered: Element | null = null

function waitingBoxOf(target: Element): Element | null {
  return target.closest('[data-island]:not([data-island-live])')
}

/** Hands the input to the innermost mounted island waiting around it, or queues it until one mounts. */
function route(input: Input): void {
  for (let at = waitingBoxOf(input.target); at !== null; at = at.parentElement === null ? null : waitingBoxOf(at.parentElement)) {
    const claim = claims.get(at)
    if (claim !== undefined) { claim(input); return }
  }
  early.push(input)
}

// Installed when this module loads, before React hydrates: a press, key or hover on HTML that no island has taken over yet is held, never lost.
if (typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element) || !event.isTrusted || waitingBoxOf(event.target) === null || event.target.closest('a[href]') !== null) return
    event.preventDefault()
    event.stopImmediatePropagation()
    route({ kind: 'press', target: event.target })
  }, true)
  document.addEventListener('keydown', (event) => {
    if (!(event.target instanceof Element) || !event.isTrusted || waitingBoxOf(event.target) === null || event.key === 'Tab') return
    event.preventDefault()
    event.stopImmediatePropagation()
    route({ kind: 'key', target: event.target, init: { key: event.key, code: event.code, shiftKey: event.shiftKey, ctrlKey: event.ctrlKey, metaKey: event.metaKey, altKey: event.altKey, bubbles: true, cancelable: true } })
  }, true)
  document.addEventListener('pointerover', (event) => { hovered = event.target instanceof Element ? event.target : null }, true)
  document.addEventListener('pointerleave', () => { hovered = null }, true)
}

/** True while the server's HTML for this island is in the page and nothing has taken it over: a client navigation mounts with no HTML to keep, so it loads at once. */
function hasServerHtml(id: string): boolean {
  if (typeof document === 'undefined') return false
  const box = document.querySelector(`[data-island="${id}"]`)
  return box !== null && !box.hasAttribute('data-island-mounted')
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
  inputs: { kind: Input['kind']; path: number[] | null; init?: KeyboardEventInit }[]
  focused: number[] | null
}

export function LazyIsland<P extends object>({ load, props, when = 'near', hydrate = false }: LazyIslandProps<P>): ReactNode {
  const id = useId()
  const box = useRef<HTMLDivElement>(null)
  const held = useRef<Held>({ inputs: [], focused: null })
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
    element.setAttribute('data-island-mounted', '')
    if (state.live) element.setAttribute('data-island-live', '')
    const open = () => { state.open() }
    for (const type of EAGER) element.addEventListener(type, open, { once: true, passive: true })
    // A swapped island replaces the HTML of every island inside it, so it keeps all their inputs; the provider hydrates, so an inner island mounts and takes its own from the queue.
    const claim = (input: Input) => {
      if (!hydrate || waitingBoxOf(input.target) === element) {
        held.current.inputs.push({ kind: input.kind, path: pathOf(element, input.target), ...(input.kind === 'key' ? { init: input.init } : {}) })
      } else early.push(input)
      open()
    }
    claims.set(element, claim)
    const queued = early.splice(0)
    for (const input of queued) {
      if (element.contains(input.target)) claim(input)
      else early.push(input)
    }
    state.onLive = () => {
      element.setAttribute('data-island-live', '')
      claims.delete(element)
      const under = hovered !== null && element.contains(hovered) ? hovered : null
      if (under !== null) {
        under.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }))
        under.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
        under.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))
      }
      for (const input of held.current.inputs) {
        const node = nodeAt(element, input.path)
        if (node === null) continue
        if (input.kind === 'press') node.click()
        else {
          node.focus({ preventScroll: true })
          node.dispatchEvent(new KeyboardEvent('keydown', input.init))
        }
      }
      held.current = { inputs: [], focused: null }
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
      claims.delete(element)
      for (const type of EAGER) element.removeEventListener(type, open)
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
