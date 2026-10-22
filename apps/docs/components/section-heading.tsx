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
  /** The anchor out of flow, before the title, so what follows the heading sits right after its text (frame 140:943). */
  anchorBefore?: boolean
}

export function SectionHeading({ id, children, anchorLabel, className, anchorBefore = false }: SectionHeadingProps) {
  return (
    <h2 id={id} className={`${className === undefined ? H2 : `${H2_BASE} ${className}`}${anchorBefore ? ' lg:relative' : ''}`}>
      {children}
      <a href={`#${id}`} aria-label={anchorLabel} className={anchorBefore ? `${ANCHOR} lg:absolute lg:inset-e-full lg:me-1` : ANCHOR}>
        <Svg icon={linkSimple} size="1rem" aria-hidden="true" />
      </a>
    </h2>
  )
}
