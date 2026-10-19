import type { ReactNode } from 'react'
import { Icon } from 'topclassui/icon'

import { slugify } from '../../lib/slug'
import { textOf } from '../../lib/text-of'
import { ANCHOR, H2 } from '../classes'

/** An `##` heading: its id from the same slug function as toc.json, and an anchor link visible on hover and focus (docs-site S11). */
export function Heading({ children, anchorLabel }: { children?: ReactNode; anchorLabel: (heading: string) => string }) {
  const text = textOf(children)
  const id = slugify(text)
  return (
    <h2 id={id} className={H2}>
      <span>{children}</span>
      <a href={`#${id}`} className={ANCHOR} aria-label={anchorLabel(text)}>
        <Icon name="link-simple" />
      </a>
    </h2>
  )
}
