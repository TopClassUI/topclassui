// R-5.7-3: renders one export with a probe className, style, ref and data-* and reports where each landed.
import { act, cleanup, render } from '@testing-library/react'
import { createElement } from 'react'
import type { JSXElementConstructor, ReactElement, ReactNode } from 'react'

export const PROBE_CLASS = 'tc-probe-class'
export const PROBE_ATTR = 'data-tc-probe'
// R-5.2-5: style may only set a --tc-* variable, so the probe is a declared one no component writes itself.
export const PROBE_STYLE = '--tc-sticky-top'
const PROBE_STYLE_VALUE = '7px'
const SLOT_ATTR = 'data-tc-slot'
const SCOPE_ATTR = 'data-tc-scope'
const SETTLE_TRIES = 20

const PROPS = ['className', 'style', 'ref', 'data'] as const
type Prop = (typeof PROPS)[number]

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

export interface RenderedCase<P> {
  /** The required props, and what the component needs to render at all; never className, style or ref. */
  props: DistributiveOmit<P, 'className' | 'style' | 'ref'>
  /** The parents a part needs, such as its Root; the element under test is passed in. */
  wrap?: (element: ReactElement) => ReactElement
  /** The root is the element this selector names, in a portal whose every other box is `role="presentation"`. */
  portal?: { root: string, decision: string }
  /** A departure recorded under the `decision` heading of docs/DECISIONS.md: the named props land on the first match
   * of the selector inside the outermost element, which `:scope` names. */
  target?: Partial<Record<Prop, string>> & { decision: string }
}

/** A Base UI Root that renders no element of its own, so there is nothing to spread onto. */
export interface HeadlessCase<P> {
  props: DistributiveOmit<P, 'className' | 'style' | 'ref'>
  /** The heading of the docs/DECISIONS.md entry that records it. */
  headless: { decision: string }
}

export type RootPropsCase<P> = RenderedCase<P> | HeadlessCase<P>

type PropsOf<C> = C extends JSXElementConstructor<infer P> ? P : never

/** The fixture of one folder: one case, or one per branch a prop opens, for every export of index.tsx and skeleton.tsx. */
export type RootPropsFixture<M> = {
  [K in keyof M as K extends `${Uppercase<string>}${string}` ? K : never]?: RootPropsCase<PropsOf<M[K]>> | RootPropsCase<PropsOf<M[K]>>[]
}

type AnyComponent = JSXElementConstructor<Record<string, unknown>>

const isAsync = (fn: unknown): fn is (props: Record<string, unknown>) => Promise<ReactNode> =>
  typeof fn === 'function' && fn.constructor.name === 'AsyncFunction'

/** The tag names from the body down to the element's parent; a portal starts beside the container, not in it. */
function pathTo(element: Element): string[] {
  const path: string[] = []
  for (let node = element.parentElement; node && node !== document.body; node = node.parentElement) path.unshift(node.tagName.toLowerCase())
  return path
}

const describeElement = (el: Element) => `<${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}>`

const signature = (el: Element) => [...el.classList].filter((c) => c !== PROBE_CLASS).sort().join(' ')

/** The first element inside `outer`, or `outer` itself, that a selector written against `:scope` matches. */
function firstScoped(outer: Element, selector: string): Element | null {
  outer.setAttribute(SCOPE_ATTR, '')
  try {
    const scoped = selector.replaceAll(':scope', `[${SCOPE_ATTR}]`)
    return outer.matches(scoped) ? outer : (outer.parentElement ?? outer).querySelector(scoped)
  } finally {
    outer.removeAttribute(SCOPE_ATTR)
  }
}

/** Whether one bullet of a docs/DECISIONS.md entry names the export as a whole word and the rule: `Select` is not `SelectRoot`. */
export function bulletRecords(entry: string, name: string): boolean {
  const word = new RegExp(`(^|[^\\w])${name}([^\\w]|$)`)
  return entry.split(/\n(?=- )|\n\n/).some((bullet) => bullet.startsWith('- ') && word.test(bullet) && bullet.includes('R-5.7-3'))
}

/** Every way the export fails R-5.7-3; an empty list is a pass. Each call starts from an empty document. */
export async function rootPropsFailures(component: unknown, entry: RootPropsCase<unknown>): Promise<string[]> {
  cleanup()
  try {
    return await failuresOf(component, entry)
  } finally {
    cleanup()
  }
}

async function settle(found: () => boolean) {
  // A lazy part, such as Command's panel, mounts a few tasks after the first render.
  for (let i = 0; i < SETTLE_TRIES && !found(); i++) {
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 10)) })
  }
}

/** What the parents render alone around a slot: where the root must sit, how many elements they make, and their classes. */
async function renderSlot(wrap: (el: ReactElement) => ReactElement) {
  await act(async () => { render(wrap(createElement('i', { [SLOT_ATTR]: '' }))); await Promise.resolve() })
  await settle(() => document.querySelector(`[${SLOT_ATTR}]`) !== null)
  const slot = document.querySelector(`[${SLOT_ATTR}]`)
  const all = [...document.body.querySelectorAll('*')]
  const result = { path: slot ? pathTo(slot) : null, count: all.length - 1, signatures: new Set(all.map(signature)) }
  cleanup()
  return result
}

async function failuresOf(component: unknown, entry: RootPropsCase<unknown>): Promise<string[]> {
  const failures: string[] = []
  const wrap = 'wrap' in entry && entry.wrap ? entry.wrap : (el: ReactElement) => el
  const parents = await renderSlot(wrap)

  const ref = { current: null as unknown }
  const props: Record<string, unknown> = {
    ...(entry.props as Record<string, unknown>),
    className: PROBE_CLASS,
    style: { [PROBE_STYLE]: PROBE_STYLE_VALUE },
    [PROBE_ATTR]: '',
    ref,
  }
  const element = isAsync(component)
    ? (await component(props)) as ReactElement
    : createElement(component as AnyComponent, props)

  let container: HTMLElement = document.createElement('div')
  await act(async () => { container = render(wrap(element)).container; await Promise.resolve() })
  await settle(() => document.querySelector(`[${PROBE_ATTR}], .${PROBE_CLASS}`) !== null)
  const probes = [...document.querySelectorAll(`[${PROBE_ATTR}]`)]

  if ('headless' in entry) {
    if (probes.length > 0) failures.push(`renders ${describeElement(probes[0] as Element)} now; drop the headless case and test its root`)
    const own = document.body.querySelectorAll('*').length - parents.count
    if (failures.length === 0 && own !== 0) failures.push(`renders ${String(own)} element(s) of its own; drop the headless case and test its root`)
    return failures
  }

  const classed = [...document.querySelectorAll(`.${PROBE_CLASS}`)]
  const styled = [...document.body.querySelectorAll('*')].filter((el) => (el as HTMLElement).style.getPropertyValue(PROBE_STYLE) === PROBE_STYLE_VALUE)
  const one = (found: Element[]) => (found.length === 1 ? found[0] as Element : `${String(found.length)} elements`)
  const landed: Record<Prop, Element | string> = {
    className: one(classed),
    style: one(styled),
    ref: ref.current instanceof Element ? ref.current : String(ref.current),
    data: one(probes),
  }
  const target: Partial<Record<Prop, string>> = entry.target ?? {}
  const roots = new Set<Element>()
  for (const prop of PROPS) {
    const el = landed[prop]
    if (typeof el === 'string') failures.push(`${prop} reaches ${el}, not one`)
    else if (target[prop] === undefined) roots.add(el)
  }
  if (failures.length > 0) return failures
  if (roots.size > 1) return [`${PROPS.filter((p) => target[p] === undefined).join(', ')} land on ${[...roots].map(describeElement).join(' and ')}, not one root`]

  const outer = entry.portal ? portalRoot([...roots][0], entry.portal.root, failures) : outermost(roots, landed, container, parents.path, failures)
  if (!outer) return failures
  for (const prop of PROPS) {
    const selector = target[prop]
    const el = landed[prop] as Element
    if (selector !== undefined && !selector.startsWith(':scope')) failures.push(`${prop}: write ${selector} against :scope, the outermost element`)
    else if (selector !== undefined && firstScoped(outer, selector) !== el) {
      failures.push(`${prop} reaches ${describeElement(el)}, not the first ${selector} in ${describeElement(outer)}`)
    }
  }
  if (signature(outer) !== '' && parents.signatures.has(signature(outer))) {
    failures.push(`the parents in wrap render an element with the classes of ${describeElement(outer)}, so its place proves nothing`)
  }
  return failures
}

/** The element the untargeted props share, or the one around the targeted props, at the place the slot held. */
function outermost(roots: Set<Element>, landed: Record<Prop, Element | string>, container: Element, expected: string[] | null, failures: string[]): Element | null {
  const root = [...roots][0]
  const start = root ?? landed.className as Element
  if (!expected) return start
  let outer: Element | null = start
  if (!root) while (outer && pathTo(outer).length > expected.length) outer = outer.parentElement
  if (!outer) return null
  const path = pathTo(outer)
  if (path.join('>') === expected.join('>')) return outer
  if (!container.contains(outer)) failures.push(`${describeElement(outer)} renders outside the tree; record the case as a portal`)
  else failures.push(`${describeElement(outer)} sits inside ${path.slice(expected.length).join('>')}; the root is its outermost element`)
  return null
}

/** A portaled root: it matches the recorded selector, and every box between it and its portal is presentation only. */
function portalRoot(root: Element | undefined, selector: string, failures: string[]): Element | null {
  if (!root) {
    failures.push('every prop of a portal case is targeted, so nothing names its root')
    return null
  }
  if (!root.matches(selector)) {
    failures.push(`${describeElement(root)} is not the recorded ${selector}`)
    return null
  }
  const portal = root.closest('[data-base-ui-portal]')
  if (!portal) {
    failures.push(`${describeElement(root)} renders in no portal; drop the portal record`)
    return null
  }
  for (let up = root.parentElement; up && up !== portal; up = up.parentElement) {
    if (up.getAttribute('role') !== 'presentation') {
      failures.push(`${describeElement(root)} sits inside ${describeElement(up)}, which is no presentation box`)
      return null
    }
  }
  return root
}
