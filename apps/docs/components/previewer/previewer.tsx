// The Previewer card (S8): head, stage and Try it, the code, every state, install. Used by a component's page and the catalog.
import { Badge } from 'topclassui/badge'
import { Svg } from 'topclassui/svg'
import { downloadSimple } from 'topclassui/icons/download-simple'
import { info } from 'topclassui/icons/info'

import { COMPONENT_PAGE_LABELS } from '../../labels/component-page'
import { chipOf } from '../../lib/chip'
import { type PagedComponent, demoSourceOf } from '../../lib/components'
import type { Locale } from '../../lib/locales'
import { countStates } from '../../lib/states'
import { snippetOf, usageOf } from '../../lib/usage'
import { CARD, CARD_HEAD, CARD_PART, CARD_TITLE, H3, LINK, SMALL, STAGE, STATE_SCOPE } from '../classes'
import { Code } from '../code'
import { Demo } from '../demo'
import { InlineText } from '../inline-text'
import { InstallRow } from './install-row'
import { CardModeSwitch, PlaygroundIsland } from './previewer-islands'
import { ModeScope, PreviewerModeProvider } from './previewer-mode'

export interface PreviewerProps {
  entry: PagedComponent
  locale: Locale
  /** On the catalog the name links to the component's page; on that page the h1 sits outside the card. */
  href?: string
  headingId?: string
  /** On the catalog: style and layout wait until the card nears the viewport (content-visibility). */
  deferred?: boolean
}

export function Previewer({ entry, locale, href, headingId, deferred = false }: PreviewerProps) {
  const t = COMPONENT_PAGE_LABELS[locale]
  const { content } = entry
  const title = content.title[locale]
  const playground = entry.files.playground && entry.controls.length > 0
  const stageDemo = content.stageDemo ?? (playground ? 'playground' : (content.demos[0] ?? 'playground'))
  const stageSource = demoSourceOf(entry, stageDemo) ?? ''
  const usage = playground ? usageOf(stageSource) : null
  const restCode = (
    <Code locale={locale} title={`${entry.slug}.tsx`} copyLabel={t.copyCode} code={usage === null ? stageSource : snippetOf(usage, [])} />
  )
  const note = (
    <p className={`flex items-start gap-2 ${SMALL}`}>
      <Svg icon={info} size="1rem" className="mt-0.5 shrink-0" aria-hidden="true" />
      <span><InlineText text={content.note[locale]} /></span>
    </p>
  )
  const descriptions = Object.fromEntries(entry.props.flatMap((part) => part.rows.map((row) => [row.name, row.description])))
  const statesSource = entry.files.states ? demoSourceOf(entry, 'states') : null
  const installId = `install-${entry.slug}`

  return (
    <PreviewerModeProvider>
      <article aria-labelledby={headingId} data-component={entry.slug} className={deferred ? `${CARD} docs-card-deferred` : CARD}>
        <header className={CARD_HEAD}>
          <div className="flex flex-wrap items-center gap-3">
            <h2 id={headingId} className={CARD_TITLE}>
              {href === undefined ? title : <a href={href} className={LINK}>{title}</a>}
            </h2>
            <Badge tone="neutral" variant="outline" size="sm"><bdi>{chipOf(entry, t.chip)}</bdi></Badge>
          </div>
          <p className={SMALL}><InlineText text={content.description[locale]} /></p>
          <div className="flex flex-wrap items-center gap-3">
            <CardModeSwitch label={t.cardMode(title)} names={t.modes} />
            <a href={`#${installId}`} className={`gap-1.5 text-sm ${LINK}`}>
              <Svg icon={downloadSimple} size="1rem" aria-hidden="true" />
              {t.install}
            </a>
          </div>
        </header>

        {playground ? (
          <div className="grid min-w-0 border-t-(length:--tc-line-width) border-line">
            <PlaygroundIsland
              slug={entry.slug}
              locale={locale}
              controls={entry.controls}
              descriptions={descriptions}
              stageHeight={content.stageHeight}
              serverStage={entry.rendering === 'client' ? null : <Demo demoKey={`${entry.slug}/playground`} />}
              restCode={restCode}
              usage={usage}
              note={note}
              labels={{ tryIt: t.tryIt, theCode: t.theCode, copyCode: t.copyCode }}
            />
          </div>
        ) : (
          <>
            <ModeScope className="grid min-w-0 border-t-(length:--tc-line-width) border-line">
              <div style={{ '--tc-stage-height': `${String(content.stageHeight)}rem` }} className={`${STAGE} min-h-(--tc-stage-height)`}>
                <Demo demoKey={`${entry.slug}/${stageDemo}`} />
              </div>
            </ModeScope>
            <div className={CARD_PART}>
              <h3 className={H3}>{t.theCode}</h3>
              {restCode}
              {note}
            </div>
          </>
        )}

        {statesSource === null ? null : (
          <div className={CARD_PART}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className={H3}>{t.everyState}</h3>
              <span className={SMALL}>{t.stateCount(countStates(statesSource))}</span>
            </div>
            <ModeScope className={STATE_SCOPE}>
              <Demo demoKey={`${entry.slug}/states`} />
            </ModeScope>
          </div>
        )}

        <InstallRow id={installId} entry={entry} locale={locale} />
      </article>
    </PreviewerModeProvider>
  )
}
