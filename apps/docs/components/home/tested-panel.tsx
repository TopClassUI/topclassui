import { BORDER } from 'topclassui/classes'
import { Icon } from 'topclassui/icon'

import type { SiteLabels } from '../../labels'
import { FACTS } from '../../lib/data'
import { PANEL } from '../classes'

/** Tested, not promised: what the library's gates check today, counted at build time (choice 11), in the drawn card's shape. */
export function TestedPanel({ labels }: { labels: SiteLabels }) {
  const text = labels.home.proof.tested
  const { pages, contrastPairs } = FACTS.checks
  const rows = [text.axe(pages), text.target(pages), text.focus(pages), text.contrast(contrastPairs)]
  return (
    <div className={PANEL}>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-body">{text.title}</h3>
        <p className="text-xs text-muted">{text.lead}</p>
      </div>
      <ul className={`flex flex-col gap-1 rounded-box bg-page p-3 ${BORDER}`}>
        {rows.map((row) => (
          <li key={row} className="flex items-start gap-2 rounded-control bg-surface px-2 py-2.5 text-xs text-body">
            <span className="text-success-on-soft"><Icon name="check-circle" size="0.875rem" /></span>
            <span>{row}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
