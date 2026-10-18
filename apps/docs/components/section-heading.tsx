// An h2 with its anchor link, named "Link to the {heading} section" (S11).
import { Svg } from 'topclassui/svg'
import { linkSimple } from 'topclassui/icons/link-simple'

import { ANCHOR, H2 } from './classes'

export interface SectionHeadingProps {
  id: string
  children: string
  anchorLabel: string
}

export function SectionHeading({ id, children, anchorLabel }: SectionHeadingProps) {
  return (
    <h2 id={id} className={H2}>
      {children}
      <a href={`#${id}`} aria-label={anchorLabel} className={ANCHOR}>
        <Svg icon={linkSimple} size="1rem" aria-hidden="true" />
      </a>
    </h2>
  )
}
