import type { ReactNode } from 'react'

import { EYEBROW, LEAD, SECTION_TITLE } from '../classes'

export interface HomeSectionProps {
  id: string
  eyebrow: string
  title: string
  lead: string
  children: ReactNode
}

/** One Home section as drawn: 6rem above, 2rem below, 1.75rem between its heading row and its body. */
export function HomeSection({ id, eyebrow, title, lead, children }: HomeSectionProps) {
  return (
    <section aria-labelledby={id} className="docs-deferred flex flex-col gap-7 pt-24 pb-8">
      <div className="flex max-w-3xl flex-col gap-3">
        <p className={EYEBROW}>{eyebrow}</p>
        <h2 id={id} className={SECTION_TITLE}>{title}</h2>
        <p className={LEAD}>{lead}</p>
      </div>
      {children}
    </section>
  )
}
