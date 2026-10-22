'use client'

// The stage, Try it and the code of one card (S8): one island, since a control changes the stage and the code together.
import { type ComponentType, type ReactNode, Suspense, lazy, useId, useMemo, useRef, useState } from 'react'
import { CodeBlock } from 'topclassui/code-block'
import { getLabels } from 'topclassui/labels/get-labels'
import { Skeleton } from 'topclassui/skeleton'

import { PLAYGROUNDS } from '../../.generated/playgrounds'
import type { Control } from '../../lib/components'
import { type PropValue, type Usage, changedProps, snippetOf } from '../../lib/usage'
import { CHECK_LABEL, CHECK_ROW, CODE_PART, CONTROL, CONTROL_LABEL, CONTROL_RESERVE, FLAT_CODE, H3, PART_ROW, PLAY_ROW, STAGE, STAGE_OPEN, STAGE_RESERVE, TRY_IT } from '../classes'
import { CopyButton } from './copy-button'
import { ModeScope } from './previewer-mode'
import { TryItControl } from './try-it-control'
import { useNearViewport } from './use-near-viewport'

type Loader = () => Promise<{ default: ComponentType<Record<string, PropValue>> }>

export interface PlaygroundIslandProps {
  slug: string
  locale: string
  controls: Control[]
  descriptions: Record<string, string>
  /** The stage's reserved height in rem, from the content file, so nothing shifts when it mounts. */
  stageHeight: number
  /** An overlay drawn open in the stage: the demo gets `stage` and the stage contains its fixed parts. */
  stageOpen: boolean
  /** The server's render of the stage at the defaults; null for a client component, which mounts near the viewport. */
  serverStage: ReactNode
  /** False when the stage at rest is another demo (stageDemo): a client one cannot stand in while the playground loads, so the reserve does. */
  stageIsPlayground: boolean
  /** The highlighted usage at the defaults, rendered on the server. */
  restCode: ReactNode
  /** The same usage as text, for the copy button. */
  restSource: string
  usage: Usage | null
  note: ReactNode
  labels: { tryIt: string; theCode: string; copyCode: string; copy: string; copied: string; copyFailed: string }
}

/** What each control shows first: the schema's default, else the first option or the minimum. */
const startOf = (controls: Control[]) => Object.fromEntries(controls.flatMap((control) => {
  if (control.default !== null) return [[control.prop, control.default]]
  if (control.kind === 'select' || control.kind === 'segmented') return control.options[0] === undefined ? [] : [[control.prop, control.options[0]]]
  if (control.kind === 'slider') return [[control.prop, control.min]]
  return []
})) as Record<string, PropValue>

export function PlaygroundIsland(props: PlaygroundIslandProps) {
  const { slug, locale, controls, descriptions, stageHeight, stageOpen, serverStage, stageIsPlayground, restCode, restSource, usage, note, labels } = props
  const idBase = useId()
  const row = useRef<HTMLDivElement>(null)
  const near = useNearViewport(row)
  const start = useMemo(() => startOf(controls), [controls])
  const [values, setValues] = useState(start)
  const changed = changedProps(values, start)
  const Demo = useMemo(() => (slug in PLAYGROUNDS ? lazy(PLAYGROUNDS[slug as keyof typeof PLAYGROUNDS] as Loader) : null), [slug])
  const reserve = <Skeleton variant="rect" className={STAGE_RESERVE} />
  // A demo reads a default* prop on mount only; a press on Try it dismisses a stage's open popup, so any change there remounts.
  const remountKey = changed.filter(([name]) => stageOpen || /^default[A-Z]/.test(name)).map(([name, value]) => `${name}=${String(value)}`).join(' ')
  const live = Demo !== null && (serverStage === null || stageOpen ? near : changed.length > 0)
  const copy = getLabels(locale, { common: { copy: labels.copyCode } }).labels
  const shown = changed.length === 0 || usage === null ? null : snippetOf(usage, changed)

  return (
    <>
      <ModeScope className={PLAY_ROW}>
        <div ref={row} style={{ '--tc-stage-height': `${String(stageHeight)}rem` }} className={stageOpen ? `${STAGE} ${STAGE_OPEN} min-h-(--tc-stage-height)` : `${STAGE} min-h-(--tc-stage-height)`}>
          {live ? <Suspense fallback={stageIsPlayground ? (serverStage ?? reserve) : reserve}><Demo key={remountKey} {...(stageOpen ? { stage: true } : {})} {...Object.fromEntries(changed)} /></Suspense> : (serverStage ?? reserve)}
        </div>
        <div className={TRY_IT}>
          <h3 className={H3}>{labels.tryIt}</h3>
          {near
            ? controls.map((control) => (
                <TryItControl
                  key={control.prop}
                  control={control}
                  value={values[control.prop]}
                  description={descriptions[control.prop] ?? ''}
                  idBase={idBase}
                  onChange={(value) => { setValues((current) => ({ ...current, [control.prop]: value })) }}
                />
              ))
            : controls.map((control) => (control.kind === 'switch'
                ? (
                    <div key={control.prop} className={CHECK_ROW}>
                      <Skeleton variant="rect" className={CONTROL_RESERVE.switch} />
                      <span dir="ltr" className={CHECK_LABEL}>{control.prop}</span>
                    </div>
                  )
                : (
                    <div key={control.prop} className={CONTROL}>
                      <span dir="ltr" className={CONTROL_LABEL}>{control.prop}</span>
                      <Skeleton variant="rect" className={CONTROL_RESERVE[control.kind]} />
                    </div>
                  )))}
        </div>
      </ModeScope>
      <div className={CODE_PART}>
        <div className={PART_ROW}>
          <h3 className={H3}>{labels.theCode}</h3>
          <CopyButton text={shown ?? restSource} label={labels.copyCode} word={labels.copy} copied={labels.copied} failed={labels.copyFailed} />
        </div>
        {shown === null ? restCode : <CodeBlock lang="tsx" title={`${slug}.tsx`} labels={copy} showCopy={false} className={FLAT_CODE}>{shown}</CodeBlock>}
        {note}
      </div>
    </>
  )
}
