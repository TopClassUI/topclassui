import { Badge } from 'topclassui/badge'
import { Button } from 'topclassui/button'
import { CardBody, CardFooter, CardHeader, CardRoot } from 'topclassui/card'
import { CodeBlock } from 'topclassui/code-block'
import { Icon } from 'topclassui/icon'
import { getLabels } from 'topclassui/labels/get-labels'
import { Separator } from 'topclassui/separator'

import type { Locale } from '../../content/pages'
import type { SiteLabels } from '../../labels'
import { kbOf } from '../../lib/chip'
import { FACTS, cardBySlug } from '../../lib/data'
import { highlight } from '../../lib/highlight'
import { ZERO_KB } from '../../lib/site'
import { PANEL } from '../classes'
import { VoidIsland } from './home-islands'

/** The components the invoice card is built from; their kinds come from meta.ts, never typed. */
const TREE = ['card', 'badge', 'separator', 'button', 'dialog'] as const

const BUDGET_FILE = 'size-budget.json'

/** Server first, measured: a real invoice Card whose one client island is the Void dialog, and the budget that holds it. */
export async function ServerPanel({ locale, labels }: { locale: Locale; labels: SiteLabels }) {
  const text = labels.home.proof.server
  const tree = TREE.map((slug) => cardBySlug(slug)).filter((entry) => entry !== undefined)
  const browserBytes = tree.reduce((total, entry) => total + (entry.clientBytes ?? 0), 0)
  // Icon is a server component with no catalog card of its own.
  const parts = [{ name: 'Icon', client: false }, ...tree.map((entry) => ({ name: entry.name, client: entry.rendering === 'client' }))]
  const client = parts.filter((part) => part.client).length
  const server = parts.length - client
  return (
    <div className={PANEL}>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-body">{text.title}</h3>
        <p className="text-xs text-muted">{text.lead(server, parts.length)}</p>
      </div>
      <CardRoot className="border-line-strong bg-surface-raised">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-body"><bdi>{text.invoice}</bdi></p>
            <Badge tone="success" size="xs">{text.paid}</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-xs text-muted">{text.issued}</p>
          <p className="text-base font-semibold text-body"><bdi>{text.amount}</bdi></p>
        </CardBody>
        <Separator />
        <CardFooter>
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <Button size="xs" variant="outline" tone="neutral"><Icon name="download-simple" />{text.download}</Button>
            <div className="flex flex-col items-center gap-1 rounded-control border border-dashed border-primary-on-soft p-1">
              <VoidIsland label={text.void} title={text.voidTitle} body={text.voidBody} keep={text.keep} />
              <code dir="ltr" className="font-mono text-xs text-primary-on-soft">{text.clientNote}</code>
            </div>
          </div>
        </CardFooter>
      </CardRoot>
      <p className="font-mono text-xs text-muted">{text.border}</p>
      <dl className="flex flex-col gap-3.5 text-xs">
        <div className="flex items-center justify-between gap-2"><dt className="text-body">{text.onServer}</dt><dd><Badge tone="success" size="xs"><bdi>{ZERO_KB}</bdi></Badge></dd></div>
        <div className="flex items-center justify-between gap-2"><dt className="text-body">{text.inBrowser}</dt><dd><Badge tone="info" size="xs">{text.inBrowserSize(kbOf(browserBytes))}</Badge></dd></div>
      </dl>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted">{text.tree}</p>
        <ul dir="ltr" className="flex flex-wrap gap-1.5">
          {parts.map((part) => <li key={part.name}><Badge tone={part.client ? 'primary' : 'success'} size="xs" className="font-mono">{part.name}</Badge></li>)}
        </ul>
        <div className="flex flex-wrap gap-3 text-xs text-muted">
          <p className="flex items-center gap-1.5"><span aria-hidden="true" className="size-2 rounded-chip bg-success-solid" />{text.treeServer(server)}</p>
          <p className="flex items-center gap-1.5"><span aria-hidden="true" className="size-2 rounded-chip bg-primary-solid" />{text.treeClient(client)}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted">{text.checkTitle}</p>
        <CodeBlock {...getLabels(locale)} lang="json" title={BUDGET_FILE} highlighted={(await highlight(FACTS.sizeBudget, 'json')) ?? undefined}>{FACTS.sizeBudget}</CodeBlock>
        <p className="text-xs text-muted">{text.checkNote}</p>
      </div>
    </div>
  )
}
