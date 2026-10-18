'use client'

// The stage, Try it and the code of one card (S8): one island, since a control changes the stage and the code together.
import { type ComponentType, type ReactNode, Suspense, lazy, useId, useMemo, useRef, useState } from 'react'
import { CodeBlock } from 'topclassui/code-block'
import { getLabels } from 'topclassui/labels/get-labels'
import { Skeleton } from 'topclassui/skeleton'

import { PLAYGROUNDS } from '../../.generated/playgrounds'
import type { Control } from '../../lib/components'
import { type PropValue, type Usage, changedProps, snippetOf } from '../../lib/usage'
import { CARD_PART, H3, PLAY_ROW, STAGE, TRY_IT } from '../classes'
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
  /** The server's render of the stage at the defaults; null for a client component, which mounts near the viewport. */
  serverStage: ReactNode
  /** The highlighted usage at the defaults, rendered on the server. */
  restCode: ReactNode
  usage: Usage | null
  note: ReactNode
  labels: { tryIt: string; theCode: string; copyCode: string }
}

/** What each control shows first: the schema's default, else the first option or the minimum. */
const startOf = (controls: Control[]) => Object.fromEntries(controls.flatMap((control) => {
  if (control.default !== null) return [[control.prop, control.default]]
  if (control.kind === 'select' || control.kind === 'segmented') return control.options[0] === undefined ? [] : [[control.prop, control.options[0]]]
  if (control.kind === 'slider') return [[control.prop, control.min]]
  return []
})) as Record<string, PropValue>

export function PlaygroundIsland(props: PlaygroundIslandProps) {
  const { slug, locale, controls, descriptions, stageHeight, serverStage, restCode, usage, note, labels } = props
  const idBase = useId()
  const row = useRef<HTMLDivElement>(null)
  const near = useNearViewport(row)
  const start = useMemo(() => startOf(controls), [controls])
  const [values, setValues] = useState(start)
  const changed = changedProps(values, start)
  const Demo = useMemo(() => (slug in PLAYGROUNDS ? lazy(PLAYGROUNDS[slug as keyof typeof PLAYGROUNDS] as Loader) : null), [slug])
  const reserve = <Skeleton variant="rect" className="size-full min-h-(--tc-stage-height)" />
  // A demo reads a default* prop on mount only, so changing one in Try it remounts it.
  const remountKey = changed.filter(([name]) => /^default[A-Z]/.test(name)).map(([name, value]) => `${name}=${String(value)}`).join(' ')
  const live = Demo !== null && (serverStage === null ? near : changed.length > 0)
  const copy = getLabels(locale, { common: { copy: labels.copyCode } }).labels

  return (
    <>
      <ModeScope className={PLAY_ROW}>
        <div ref={row} style={{ '--tc-stage-height': `${String(stageHeight)}rem` }} className={`${STAGE} min-h-(--tc-stage-height)`}>
          {live ? <Suspense fallback={serverStage ?? reserve}><Demo key={remountKey} {...Object.fromEntries(changed)} /></Suspense> : (serverStage ?? reserve)}
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
            : <Skeleton rows={controls.length * 2} />}
        </div>
      </ModeScope>
      <div className={CARD_PART}>
        <h3 className={H3}>{labels.theCode}</h3>
        {changed.length === 0 || usage === null ? restCode : <CodeBlock lang="tsx" title={`${slug}.tsx`} labels={copy}>{snippetOf(usage, changed)}</CodeBlock>}
        {note}
      </div>
    </>
  )
}
