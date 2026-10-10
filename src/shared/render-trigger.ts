import { Children, cloneElement, createElement, isValidElement, type ReactElement, type ReactNode } from 'react'

import { cn } from './cn.js'

type Own = { className?: string, children?: ReactNode }

/** The same element with no children key: cloneElement can replace a prop and never remove one. */
function withoutChildren(element: ReactElement<Own>, merged: Own): ReactElement {
  const props: Record<string, unknown> = { ...element.props, ...merged }
  delete props['children']
  if (element.key !== null) props['key'] = element.key
  return createElement(element.type, props)
}

/** The `render` and `className` an overlay trigger hands its Base UI part. An element takes the
 * className through cn(), so the caller's class wins, and loses a children key that holds nothing,
 * so the part's label is not erased; a function form, or nothing to change, comes back as given. */
export function renderTrigger<Render>(
  render: Render,
  className: string | undefined,
): { render: Render | ReactElement, className: string | undefined } {
  // Flight hands an element built in a Server Component over as a lazy wrapper; toArray unwraps it.
  const element = isValidElement(render) || typeof render === 'function' ? render : Children.toArray(render as ReactNode)[0]
  const own = isValidElement<Own>(element) ? element : undefined
  // In Base UI the element's own props win, so a children key with no value would erase the part's label.
  const bare = own !== undefined && 'children' in own.props && own.props.children === undefined
  if (!own || (className === undefined && !bare)) return { render, className }
  // Base UI only joins the two class strings, and a server-built Button has already run its cn().
  const merged = className === undefined ? {} : { className: cn(own.props.className, className) }
  return { render: bare ? withoutChildren(own, merged) : cloneElement(own, merged), className: undefined }
}

/** Whether children put anything on the page, which decides between a part's built-in control and
 * the caller's own. React draws nothing for null, undefined, a boolean or an empty string, so
 * `{saving && 'Saving'}` is no content while it is false. */
export function hasContent(children: unknown): boolean {
  if (Array.isArray(children)) return children.some(hasContent)
  return children !== null && children !== undefined && typeof children !== 'boolean' && children !== ''
}
