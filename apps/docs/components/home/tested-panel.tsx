import { BORDER } from 'topclassui/classes'
import { Icon } from 'topclassui/icon'

import type { SiteLabels } from '../../labels'
import { FACTS } from '../../lib/data'

/** Tested, not promised: what the library's gates check today, counted at build time (choice 11). */
export function TestedPanel({ labels }: { labels: SiteLabels }) {
  const text = labels.home.proof.tested
  const { pages, contrastPairs } = FACTS.checks
  const rows = [text.axe(pages), text.target(pages), text.focus(pages), text.contrast(contrastPairs)]
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-body">{text.title}</h3>
      <p className="text-sm text-muted">{text.lead}</p>
      <ul className={`flex flex-col gap-3 rounded-box p-4 ${BORDER}`}>
        {rows.map((row) => (
          <li key={row} className="flex items-start gap-2 text-sm text-body">
            <span className="mt-0.5 text-success-on-soft"><Icon name="check-circle" /></span>
            <span>{row}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
