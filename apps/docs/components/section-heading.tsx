// An h2 with its anchor link, named "Link to the {heading} section" (S11).
import { Svg } from 'topclassui/svg'
import { linkSimple } from 'topclassui/icons/link-simple'

import { ANCHOR, H2, H2_BASE } from './classes'

export interface SectionHeadingProps {
  id: string
  children: string
  anchorLabel: string
  /** A size class that replaces the h2's own, for a heading set inside a card. */
  className?: string
}

export function SectionHeading({ id, children, anchorLabel, className }: SectionHeadingProps) {
  return (
    <h2 id={id} className={className === undefined ? H2 : `${H2_BASE} ${className}`}>
      {children}
      <a href={`#${id}`} aria-label={anchorLabel} className={ANCHOR}>
        <Svg icon={linkSimple} size="1rem" aria-hidden="true" />
      </a>
    </h2>
  )
}
