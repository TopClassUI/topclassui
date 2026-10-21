import { BORDER } from 'topclassui/classes'
import { DIRECTIONAL, ICON_NAMES } from 'topclassui/icons'

import type { SiteLabels } from '../../labels'
import { CARDS, FACTS } from '../../lib/data'
import { ZERO_KB } from '../../lib/site'

const GLOWS = ['docs-number-primary', 'docs-number-info', 'docs-number-success', 'docs-number-warning'] as const

/** Four numbers, each read from the package or the generated data, never typed; each card glows in its own tone. */
export function Numbers({ labels }: { labels: SiteLabels }) {
  const text = labels.home.numbers
  const items = [
    { value: String(CARDS.length), label: text.components },
    { value: String(ICON_NAMES.length), label: text.icons(DIRECTIONAL.size) },
    { value: String(FACTS.checks.modes * FACTS.checks.directions), label: text.pages },
    { value: ZERO_KB, label: text.zero },
  ]
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <li key={item.label} className={`docs-number docs-lift ${GLOWS[index] ?? ''} relative isolate flex min-h-48 flex-col gap-2.5 overflow-hidden rounded-box px-6.5 py-7 text-start ${BORDER}`}>
          <span aria-hidden="true" className="docs-number-glow" />
          <span className="docs-number-value text-6xl font-semibold"><bdi>{item.value}</bdi></span>
          <span className="text-sm text-muted">{item.label}</span>
        </li>
      ))}
    </ul>
  )
}
