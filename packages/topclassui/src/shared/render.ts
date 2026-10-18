import { mergeProps } from '@base-ui/react/merge-props'
import { Fragment, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'

import { cn } from './cn.js'

type Props = Record<string, unknown>

type AnyRef = ((node: unknown) => unknown) | { current: unknown } | null | undefined

function applyRef(ref: AnyRef, node: unknown): (() => void) | undefined {
  if (typeof ref === 'function') {
    const cleanup = ref(node)
    return typeof cleanup === 'function' ? (cleanup as () => void) : undefined
  }
  if (ref && typeof ref === 'object') {
    ref.current = node
    return () => { ref.current = null }
  }
  return undefined
}

/** Both must run: dropping one stops either the component or the caller seeing the node. */
function composeRefs(a: AnyRef, b: AnyRef): AnyRef {
  if (!a) return b
  if (!b) return a
  return (node: unknown) => {
    const cleanups = [applyRef(a, node), applyRef(b, node)]
    return () => { for (const done of cleanups) done?.() }
  }
}

/** R-5.7-4: the element form of `render`, no hooks, so it works in a server
 * component. `decorate` wraps whichever children survive, so a spinner is not lost. */
export function renderElement(
  element: ReactElement,
  base: Props,
  decorate?: (children: ReactNode) => ReactNode,
): ReactElement {
  if (!isValidElement(element)) {
    throw new TypeError('render must be an element, such as render={<Link href="/x" />}')
  }
  // A Fragment takes no className, no data-* and no ref, so it would drop the whole look.
  if (element.type === Fragment) {
    throw new TypeError('render must be an element that takes attributes, not a fragment')
  }

  const own = (element.props ?? {}) as Props

  // Base UI merges className right to left, which would invert tailwind-merge.
  const merged = mergeProps<'div'>(base as never, own as never) as unknown as Props
  // undefined, not delete: deleting lets the element's own empty className survive cloneElement.
  const className = cn(base['className'] as never, own['className'] as never)
  merged['className'] = className === '' ? undefined : className

  // mergeProps leaves ref alone, so both are composed rather than one winning.
  const composed = composeRefs(own['ref'] as AnyRef, base['ref'] as AnyRef)
  if (composed) merged['ref'] = composed

  // An element written with children keeps them; otherwise the component supplies them.
  const children = own['children'] === undefined ? base['children'] : own['children']
  merged['children'] = decorate ? decorate(children as ReactNode) : children

  return cloneElement(element, merged)
}
