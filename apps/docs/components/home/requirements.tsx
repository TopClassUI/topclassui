import { BORDER } from 'topclassui/classes'

import type { SiteLabels } from '../../labels'
import { NEXT_RANGE, PEERS } from '../../lib/site'

/** Next.js, React and Tailwind CSS with the floor of each range the package declares; no brand logos. */
export function Requirements({ labels }: { labels: SiteLabels }) {
  const text = labels.home.need
  const items = [
    { range: NEXT_RANGE, ...text.next },
    { range: PEERS.react, ...text.react },
    { range: PEERS.tailwindcss, ...text.tailwind },
  ]
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {items.map((item) => (
        <li key={item.name} className={`flex flex-col gap-2 rounded-box bg-surface p-6 ${BORDER}`}>
          <span className="text-4xl font-semibold text-body"><bdi>{item.range}</bdi></span>
          <span className="text-xl font-semibold text-body">{item.name}</span>
          <span className="text-sm text-muted">{item.line}</span>
        </li>
      ))}
    </ul>
  )
}
