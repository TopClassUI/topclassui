// The Previewer card (S8): head, stage and Try it, the code, every state, install. Used by a component's page and the catalog.
import type { ReactNode } from 'react'
import { Badge } from 'topclassui/badge'
import { Button } from 'topclassui/button'
import { Svg } from 'topclassui/svg'
import { downloadSimple } from 'topclassui/icons/download-simple'
import { info } from 'topclassui/icons/info'

import { CLIENT_DEMO_KEYS, SERVER_DEMOS } from '../../.generated/server-demos'
import { COMPONENT_PAGE_LABELS } from '../../labels/component-page'
import { chipOf } from '../../lib/chip'
import { type PagedComponent, demoSourceOf } from '../../lib/components'
import type { Locale } from '../../lib/locales'
import { countStates } from '../../lib/states'
import { sampleOf, stagelessOf } from '../../lib/sample'
import { snippetOf, usageOf } from '../../lib/usage'
import { withStarts } from '../../scripts/lib/controls'
import { CARD_PART, CARD_TITLE, CODE_PART, FLAT_CODE, H3, LINK, NOTE, PART_ROW, PREVIEWER, PREVIEWER_HEAD, SMALL, STAGE } from '../classes'
import { Code } from '../code'
import { Demo } from '../demo'
import { InlineText } from '../inline-text'
import { InstallRow } from './install-row'
import { ClientStates } from './client-states'
import { CardModeSwitch, CopyButton, PlaygroundIsland } from './previewer-islands'
import { StateStrip, type StateStripProps } from './state-strip'
import { ModeScope, PreviewerModeProvider } from './previewer-mode'

/** The chip's colour by where the component renders, as the frames tint it. */
const CHIP_TONE = { server: 'success', split: 'info', client: 'primary' } as const

export interface PreviewerProps {
  entry: PagedComponent
  locale: Locale
  /** On the catalog the name links to the component's page; on that page the h1 sits outside the card. */
  href?: string
  headingId?: string
  /** On the catalog: style and layout wait until the card nears the viewport (content-visibility). */
  deferred?: boolean
}

/** A server states demo is called here, so its root's children become the strip's cells; one with a client part goes to its island. */
async function StatesPart({ demoKey, ...props }: Omit<StateStripProps, 'tree'> & { demoKey: string }) {
  if (CLIENT_DEMO_KEYS.includes(demoKey)) return <ClientStates demoKey={demoKey} {...props} />
  if (!(demoKey in SERVER_DEMOS)) return null
  const { default: Component } = (await SERVER_DEMOS[demoKey as keyof typeof SERVER_DEMOS]()) as { default: (props: Record<string, never>) => ReactNode | Promise<ReactNode> }
  return <StateStrip tree={await Component({})} {...props} />
}

export function Previewer({ entry, locale, href, headingId, deferred = false }: PreviewerProps) {
  const t = COMPONENT_PAGE_LABELS[locale]
  const { content } = entry
  const title = content.title[locale]
  const order = content.controlOrder ?? []
  const rank = (prop: string) => (order.includes(prop) ? order.indexOf(prop) : order.length)
  const controls = withStarts([...entry.controls, ...(content.extraSwitches ?? []).map((prop) => ({ prop, kind: 'switch' as const, default: false }))], content.starts ?? {})
    .filter((control) => !(content.controlsHidden ?? []).includes(control.prop))
    .map((control, index) => ({ control, index }))
    .sort((a, b) => rank(a.control.prop) - rank(b.control.prop) || a.index - b.index)
    .map(({ control }) => control)
  const playground = entry.files.playground && controls.length > 0
  // The stage at rest is the demo the frame draws (stageDemo); Try it swaps in the playground on the first change.
  const stageDemo = content.stageDemo ?? (playground ? 'playground' : (content.demos[0] ?? 'playground'))
  const stageSource = demoSourceOf(entry, stageDemo) ?? ''
  const playgroundSource = demoSourceOf(entry, 'playground') ?? ''
  // An overlay's playground draws the docs stage too: the usage is read from it once the stage is gone.
  const usage = playground ? (usageOf(playgroundSource) ?? usageOf(stagelessOf(playgroundSource))) : null
  const restSource = usage === null || stageDemo !== 'playground' ? sampleOf(stageSource) : snippetOf(usage, [])
  const restCode = <Code locale={locale} title={`${entry.slug}.tsx`} copyLabel={t.copyCode} code={restSource} className={FLAT_CODE} />
  const note = (
    <p className={`flex items-start gap-2 ${NOTE}`}>
      <Svg icon={info} size="0.75rem" className="mt-0.5 shrink-0" aria-hidden="true" />
      <span><InlineText text={content.note[locale]} /></span>
    </p>
  )
  const descriptions = Object.fromEntries(entry.props.flatMap((part) => part.rows.map((row) => [row.name, row.description])))
  const statesSource = entry.files.states ? demoSourceOf(entry, 'states') : null
  const installId = `install-${entry.slug}`
  const counts = Array.from({ length: 25 }, (_, n) => t.stateCount(n))

  return (
    <PreviewerModeProvider>
      <article aria-labelledby={headingId} data-component={entry.slug} className={deferred ? `${PREVIEWER} docs-card-deferred` : PREVIEWER}>
        <header className={PREVIEWER_HEAD}>
          <div className="grid min-w-0 flex-1 basis-80 gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id={headingId} className={CARD_TITLE}>
                {href === undefined ? title : <a href={href} className={LINK}>{title}</a>}
              </h2>
              <Badge tone={CHIP_TONE[entry.rendering]} variant="soft" size="sm" className="font-mono"><bdi>{chipOf(entry, t.chip)}</bdi></Badge>
            </div>
            <p className={SMALL}><InlineText text={content.description[locale]} /></p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <CardModeSwitch label={t.cardMode(title)} names={t.modes} />
            <Button size="sm" render={<a href={`#${installId}`} />}>
              <Svg icon={downloadSimple} size="0.875rem" aria-hidden="true" />
              {t.install}
            </Button>
          </div>
        </header>

        {playground ? (
          <div className="grid min-w-0 border-t-(length:--tc-line-width) border-line">
            <PlaygroundIsland
              slug={entry.slug}
              locale={locale}
              controls={controls}
              descriptions={descriptions}
              stageHeight={content.stageHeight}
              stageOpen={content.stageOpen === true}
              serverStage={stageDemo !== 'playground' ? <Demo demoKey={`${entry.slug}/${stageDemo}`} /> : entry.rendering === 'client' ? null : <Demo demoKey={`${entry.slug}/playground`} />}
              restCode={restCode}
              restSource={restSource}
              usage={usage}
              note={note}
              labels={{ tryIt: t.tryIt, theCode: t.theCode, copyCode: t.copyCode, copy: t.copy, copied: t.copied, copyFailed: t.copyFailed }}
            />
          </div>
        ) : (
          <>
            <ModeScope className="grid min-w-0 border-t-(length:--tc-line-width) border-line">
              <div style={{ '--tc-stage-height': `${String(content.stageHeight)}rem` }} className={`${STAGE} min-h-(--tc-stage-height)`}>
                <Demo demoKey={`${entry.slug}/${stageDemo}`} />
              </div>
            </ModeScope>
            <div className={CODE_PART}>
              <div className={PART_ROW}>
                <h3 className={H3}>{t.theCode}</h3>
                <CopyButton text={restSource} label={t.copyCode} word={t.copy} copied={t.copied} failed={t.copyFailed} />
              </div>
              {restCode}
              {note}
            </div>
          </>
        )}

        {statesSource === null ? null : (
          <div className={CARD_PART}>
            <StatesPart demoKey={`${entry.slug}/states`} heading={t.everyState} counts={counts} sourceCount={countStates(statesSource)} />
          </div>
        )}

        <InstallRow id={installId} entry={entry} locale={locale} />
      </article>
    </PreviewerModeProvider>
  )
}
