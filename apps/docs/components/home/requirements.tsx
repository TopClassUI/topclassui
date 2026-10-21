import type { SiteLabels } from '../../labels'
import { NEXT_RANGE, PEERS } from '../../lib/site'
import { TILE, TINT } from '../classes'
import { NextMark, ReactMark, TailwindMark } from './brand-logos'

/** Next.js, React and Tailwind CSS with the floor of each range the package declares, each under its brand mark. */
export function Requirements({ labels }: { labels: SiteLabels }) {
  const text = labels.home.need
  const items = [
    { range: NEXT_RANGE, tone: 'neutral', Mark: NextMark, ...text.next },
    { range: PEERS.react, tone: 'info', Mark: ReactMark, ...text.react },
    { range: PEERS.tailwindcss, tone: 'primary', Mark: TailwindMark, ...text.tailwind },
  ] as const
  return (
    <ul className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {items.map(({ Mark, ...item }) => (
        <li key={item.name} className={`docs-lift docs-hover-lift flex flex-col items-center gap-4.5 overflow-hidden rounded-[1.25rem] p-8 text-center ${TINT[item.tone]}`}>
          <span aria-hidden="true" className={`docs-tile inline-flex size-22 items-center justify-center rounded-[1.5rem] ${TILE[item.tone]}`}><Mark className="size-12" /></span>
          <span className="text-[2.75rem] leading-[normal] font-semibold"><bdi>{item.range}</bdi></span>
          <h3 className="text-xl leading-[normal] font-semibold">{item.name}</h3>
          <p className="text-sm leading-[1.55] opacity-90">{item.line}</p>
        </li>
      ))}
    </ul>
  )
}
