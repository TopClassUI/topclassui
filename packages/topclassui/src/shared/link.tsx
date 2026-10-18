import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'

import { renderElement } from './render.js'
import { renderTrigger } from './render-trigger.js'

/** R-5.7-4: one link from the caller's `link` element, or a plain anchor. The href is cloned
 * in first, because renderElement lets the element's own props win and its href is a stand-in. */
export function renderLink(
  component: string,
  link: ReactElement | undefined,
  href: string,
  props: Record<string, unknown>,
): ReactElement {
  // Said here, by the name of the prop: cloneElement would fail first, with React's own words.
  if (link != null && !isValidElement(link)) {
    throw new TypeError(`${component}: link must be an element, such as link={<Link href="" />}`)
  }
  return renderElement(cloneElement((link ?? <a />) as ReactElement<{ href?: string }>, { href }), props)
}

/** The anchor of a menu row: the caller's `link` element with the href cloned in, or a plain anchor.
 * Flight can hand an element built on the server over as a lazy wrapper; toArray unwraps it.
 * renderLink leaves a children key that holds nothing, which Base UI would let erase the row: renderTrigger drops it. */
export function toLinkElement(component: string, link: ReactElement | undefined, href: string): ReactElement {
  const unwrapped = link == null || isValidElement(link) ? link : Children.toArray(link as ReactNode)[0]
  return renderTrigger(renderLink(component, unwrapped as ReactElement | undefined, href, {}), undefined).render
}
