import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'

import { cn } from './cn.js'

/** The `render` and `className` an overlay trigger hands its Base UI part. An element, even one
 * a Server Component built, takes the className through cn(), so the caller's class wins a
 * conflict; a function form, a missing render or a missing className come back as given. */
export function renderTrigger<Render>(
  render: Render,
  className: string | undefined,
): { render: Render | ReactElement, className: string | undefined } {
  // Flight hands an element built in a Server Component over as a lazy wrapper; toArray unwraps it.
  const element = isValidElement(render) || typeof render === 'function' ? render : Children.toArray(render as ReactNode)[0]
  // Base UI only joins the two class strings, and a server-built Button has already run its cn().
  const own = className !== undefined && isValidElement<{ className?: string }>(element) ? element : undefined
  if (!own) return { render, className }
  return { render: cloneElement(own, { className: cn(own.props.className, className) }), className: undefined }
}
