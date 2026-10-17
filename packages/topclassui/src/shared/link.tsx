import { cloneElement, isValidElement, type ReactElement } from 'react'

import { renderElement } from './render.js'

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
