import { mergeProps } from '@base-ui/react/merge-props'
import { cloneElement, isValidElement, type ReactElement } from 'react'

import { cn } from './cn.js'

type Props = Record<string, unknown>

/**
 * R-5.7-4: the element form of `render`, with no hooks, so it works in a Server
 * Component. `<Button render={<Link href="/docs" />}>` becomes a real anchor that
 * looks like a button and still costs 0 KB.
 */
export function renderElement(element: ReactElement, props: Props): ReactElement {
  if (!isValidElement(element)) {
    throw new TypeError('render must be an element, such as render={<Link href="/x" />}')
  }

  const own = (element.props ?? {}) as Props

  // Base UI merges className right to left, which would invert tailwind-merge.
  const merged = mergeProps<'div'>(props as never, own as never) as unknown as Props
  const className = cn(props['className'] as never, own['className'] as never)
  if (className) merged['className'] = className
  else delete merged['className']

  // mergeProps leaves ref alone, and an explicit ref on the render element wins.
  if (own['ref'] === undefined && props['ref'] !== undefined) merged['ref'] = props['ref']

  // An element written with children keeps them; otherwise the component supplies them.
  if (own['children'] === undefined) merged['children'] = props['children']

  return cloneElement(element, merged)
}
