import type { ReactNode } from 'react'

import { EYEBROW, LEAD, SECTION_TITLE } from '../classes'

export interface HomeSectionProps {
  id: string
  eyebrow: string
  title: string
  lead: string
  children: ReactNode
}

/** One Home section as drawn: 6rem above, 2rem below, the heading centred, 1.75rem between it and the body. */
export function HomeSection({ id, eyebrow, title, lead, children }: HomeSectionProps) {
  return (
    <section aria-labelledby={id} data-motion="reveal" className="docs-deferred flex flex-col gap-7 pt-24 pb-8">
      <div className="flex flex-col items-center gap-2.5 text-center">
        <p className={EYEBROW}>{eyebrow}</p>
        <h2 id={id} className={SECTION_TITLE}>{title}</h2>
        <p className={LEAD}>{lead}</p>
      </div>
      {children}
    </section>
  )
}
