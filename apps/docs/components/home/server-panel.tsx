import { Badge } from 'topclassui/badge'
import { Button } from 'topclassui/button'
import { BORDER } from 'topclassui/classes'
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
import { VoidIsland } from './home-islands'
import { ZERO_KB } from '../../lib/site'

/** The components the invoice card is built from; their kinds come from meta.ts, never typed. */
const TREE = ['card', 'badge', 'separator', 'button', 'dialog'] as const

const BUDGET_FILE = 'size-budget.json'

/** Server first, measured: a real invoice Card whose one client island is the Void dialog, and the budget that holds it. */
export async function ServerPanel({ locale, labels }: { locale: Locale; labels: SiteLabels }) {
  const text = labels.home.proof.server
  const tree = TREE.map((slug) => cardBySlug(slug)).filter((entry) => entry !== undefined)
  const browserBytes = tree.reduce((total, entry) => total + (entry.clientBytes ?? 0), 0)
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
        <div><dt className="text-muted">{text.inBrowser}</dt><dd className="font-semibold text-body">{text.inBrowserSize(kbOf(browserBytes))}</dd></div>
      </dl>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-body">{text.checkTitle}</p>
        <CodeBlock {...getLabels(locale)} lang="json" title={BUDGET_FILE} highlighted={(await highlight(FACTS.sizeBudget, 'json')) ?? undefined}>{FACTS.sizeBudget}</CodeBlock>
        <p className="text-xs text-muted">{text.checkNote}</p>
      </div>
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
