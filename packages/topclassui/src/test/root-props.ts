// R-5.7-3: renders one export with a probe className, ref and data-* and reports where each landed.
import { act, cleanup, render } from '@testing-library/react'
import { createElement } from 'react'
import type { JSXElementConstructor, ReactElement, ReactNode } from 'react'

export const PROBE_CLASS = 'tc-probe-class'
export const PROBE_ATTR = 'data-tc-probe'
const SLOT_ATTR = 'data-tc-slot'
const SETTLE_TRIES = 20

const PROPS = ['className', 'ref', 'data'] as const
type Prop = (typeof PROPS)[number]

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

export interface RenderedCase<P> {
  /** The required props, and what the component needs to render at all; never className or ref. */
  props: DistributiveOmit<P, 'className' | 'ref'>
  /** The parents a part needs, such as its Root; the element under test is passed in. */
  wrap?: (element: ReactElement) => ReactElement
  /** The root renders into a portal, so its place in the tree is not compared. */
  portal?: true
  /** A departure recorded under the `decision` heading of docs/DECISIONS.md: the named props land here instead. */
  target?: Partial<Record<Prop, string>> & { decision: string }
}

/** A Base UI Root that renders no element of its own, so there is nothing to spread onto. */
export interface HeadlessCase<P> {
  props: DistributiveOmit<P, 'className' | 'ref'>
  /** The heading of the docs/DECISIONS.md entry that records it. */
  headless: { decision: string }
}

export type RootPropsCase<P> = RenderedCase<P> | HeadlessCase<P>

type PropsOf<C> = C extends JSXElementConstructor<infer P> ? P : never

/** The fixture of one folder: one case for every component its index.tsx and skeleton.tsx export. */
export type RootPropsFixture<M> = {
  [K in keyof M as K extends `${Uppercase<string>}${string}` ? K : never]?: RootPropsCase<PropsOf<M[K]>>
}

type AnyComponent = JSXElementConstructor<Record<string, unknown>>

const isAsync = (fn: unknown): fn is (props: Record<string, unknown>) => Promise<ReactNode> =>
  typeof fn === 'function' && fn.constructor.name === 'AsyncFunction'

/** The tag names from the container down to the element's parent, which a wrapper alone also produces. */
function pathTo(element: Element, container: Element): string[] | null {
  const path: string[] = []
  for (let node = element.parentElement; node !== container; node = node.parentElement) {
    if (!node) return null
    path.unshift(node.tagName.toLowerCase())
  }
  return path
}

const describeElement = (el: Element) => `<${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}>`

/** Every way the export fails R-5.7-3; an empty list is a pass. Each call starts from an empty document. */
export async function rootPropsFailures(component: unknown, entry: RootPropsCase<unknown>): Promise<string[]> {
  cleanup()
  try {
    return await failuresOf(component, entry)
  } finally {
    cleanup()
  }
}

async function failuresOf(component: unknown, entry: RootPropsCase<unknown>): Promise<string[]> {
  const failures: string[] = []
  const ref = { current: null as unknown }
  const props: Record<string, unknown> = {
    ...(entry.props as Record<string, unknown>),
    className: PROBE_CLASS,
    [PROBE_ATTR]: '',
    ref,
  }
  const element = isAsync(component)
    ? (await component(props)) as ReactElement
    : createElement(component as AnyComponent, props)
  const wrap = 'wrap' in entry && entry.wrap ? entry.wrap : (el: ReactElement) => el

  let container: HTMLElement = document.createElement('div')
  await act(async () => { container = render(wrap(element)).container; await Promise.resolve() })
  // A lazy part, such as Command's panel, mounts a few tasks after the first render.
  for (let i = 0; i < SETTLE_TRIES && !document.querySelector(`[${PROBE_ATTR}], .${PROBE_CLASS}`); i++) {
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 10)) })
  }
  const probes = [...document.querySelectorAll(`[${PROBE_ATTR}]`)]

  if ('headless' in entry) {
    if (probes.length > 0) failures.push(`renders ${describeElement(probes[0] as Element)} now; drop the headless case and test its root`)
    return failures
  }

  const classed = [...document.querySelectorAll(`.${PROBE_CLASS}`)]
  const landed: Record<Prop, Element | string> = {
    data: probes.length === 1 ? probes[0] as Element : `${String(probes.length)} elements`,
    className: classed.length === 1 ? classed[0] as Element : `${String(classed.length)} elements`,
    ref: ref.current instanceof Element ? ref.current : String(ref.current),
  }
  const target: Partial<Record<Prop, string>> = 'target' in entry && entry.target ? entry.target : {}
  const roots = new Set<Element>()
  for (const prop of PROPS) {
    const el = landed[prop]
    if (typeof el === 'string') { failures.push(`${prop} reaches ${el}, not one`); continue }
    const selector = target[prop]
    if (selector === undefined) roots.add(el)
    else if (!el.matches(selector)) failures.push(`${prop} reaches ${describeElement(el)}, not the recorded ${selector}`)
  }
  if (failures.length > 0) return failures
  if (roots.size > 1) {
    failures.push(`className, ref and data-* land on ${[...roots].map(describeElement).join(' and ')}, not one root`)
    return failures
  }
  const root = [...roots][0]
  if (!root) return failures

  const path = pathTo(root, container)
  if (entry.portal) return failures
  if (!path) {
    failures.push(`${describeElement(root)} renders outside the tree; mark the case portal`)
    return failures
  }
  let slotContainer: HTMLElement = document.createElement('div')
  await act(async () => { slotContainer = render(wrap(createElement('i', { [SLOT_ATTR]: '' }))).container; await Promise.resolve() })
  const slot = slotContainer.querySelector(`[${SLOT_ATTR}]`)
  const expected = slot ? pathTo(slot, slotContainer) : null
  if (expected && path.join('>') !== expected.join('>')) {
    failures.push(`${describeElement(root)} sits inside ${path.slice(expected.length).join('>')}; the root is its outermost element`)
  }
  return failures
}
