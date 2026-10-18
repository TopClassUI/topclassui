import { Badge } from 'topclassui/badge'
import { Button } from 'topclassui/button'
import { BORDER } from 'topclassui/classes'
import { CardBody, CardFooter, CardHeader, CardRoot } from 'topclassui/card'
import { Icon } from 'topclassui/icon'
import { Separator } from 'topclassui/separator'

import type { SiteLabels } from '../../labels'
import { cardBySlug } from '../../lib/data'
import { VoidIsland } from './home-islands'
import { ZERO_KB } from '../../lib/site'

/** The components the invoice card is built from; their kinds come from meta.ts, never typed. */
const TREE = ['card', 'badge', 'separator', 'button', 'dialog'] as const

/** Server first, measured: a real invoice Card whose one client island is the Void dialog. */
export function ServerPanel({ labels }: { labels: SiteLabels }) {
  const text = labels.home.proof.server
  const tree = TREE.map((slug) => cardBySlug(slug)).filter((entry) => entry !== undefined)
  // Icon is a server component with no catalog card of its own.
  const names = ['Icon', ...tree.map((entry) => entry.name)]
  const client = tree.filter((entry) => entry.rendering === 'client').length
  const server = names.length - client
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-body">{text.title}</h3>
      <p className="text-sm text-muted">{text.lead(server, names.length)}</p>
      <CardRoot className="border-solid">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-body"><bdi>{text.invoice}</bdi></p>
            <Badge tone="success">{text.paid}</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-muted">{text.issued}</p>
          <p className="text-base font-semibold text-body"><bdi>{text.amount}</bdi></p>
        </CardBody>
        <Separator />
        <CardFooter>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" tone="neutral"><Icon name="download-simple" />{text.download}</Button>
            <div className="flex items-center gap-2 rounded-control border border-dashed border-line-strong p-1">
              <VoidIsland label={text.void} title={text.voidTitle} body={text.voidBody} keep={text.keep} />
              <code dir="ltr" className="font-mono text-xs text-muted">{text.clientNote}</code>
            </div>
          </div>
        </CardFooter>
      </CardRoot>
      <p className="text-xs text-muted">{text.border}</p>
      <dl className={`grid grid-cols-2 gap-3 rounded-box p-3 text-sm ${BORDER}`}>
        <div><dt className="text-muted">{text.onServer}</dt><dd className="font-semibold text-body">{ZERO_KB}</dd></div>
        <div><dt className="text-muted">{text.inBrowser}</dt><dd className="font-semibold text-body">{text.notMeasured}</dd></div>
      </dl>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-body">{text.tree}</p>
        <ul dir="ltr" className="flex flex-wrap gap-1.5">
          {names.map((name) => <li key={name}><code className="rounded-chip bg-neutral-soft px-1.5 py-0.5 font-mono text-xs text-body">{name}</code></li>)}
        </ul>
        <p className="text-xs text-muted">{text.treeSummary(server, client)}</p>
      </div>
    </div>
  )
}
