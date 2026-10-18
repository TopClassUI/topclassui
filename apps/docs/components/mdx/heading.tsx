import type { ReactNode } from 'react'
import { FOCUS_RING, TOUCH_TARGET } from 'topclassui/classes'
import { Icon } from 'topclassui/icon'

import { slugify } from '../../lib/slug'
import { textOf } from '../../lib/text-of'

const ANCHOR = `inline-flex items-center rounded-chip text-muted ${TOUCH_TARGET} justify-center ${FOCUS_RING}`

/** An `##` heading: its id from the same slug function as toc.json, and an anchor link visible on focus (docs-site S11). */
export function Heading({ children, anchorLabel }: { children?: ReactNode; anchorLabel: (heading: string) => string }) {
  const text = textOf(children)
  const id = slugify(text)
  return (
    <h2 id={id} className="flex items-center gap-2 text-xl font-semibold text-body">
      <span>{children}</span>
      <a href={`#${id}`} className={ANCHOR} aria-label={anchorLabel(text)}>
        <Icon name="link-simple" />
      </a>
    </h2>
  )
}
