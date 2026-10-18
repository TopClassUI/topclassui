// Examples (page 14, section 3): each demo a Preview and a Code tab, both in the HTML; the rtl one in Arabic.
import type { ReactNode } from 'react'

import { COMPONENT_PAGE_LABELS } from '../../labels/component-page'
import { type PagedComponent, demoSourceOf } from '../../lib/components'
import type { Locale } from '../../lib/locales'
import { DEMO_GRID, LIST, STAGE } from '../classes'
import { Code } from '../code'
import { Demo } from '../demo'
import { InlineText } from '../inline-text'
import { TopClassProvider } from '../shell/provider-island'
import { DENSITY, KNOB_DEFAULTS, RADIUS } from './knob-values'
import { ExampleKnobs, ExampleTabs } from './page-islands'

const EXAMPLES_ID = 'examples-grid'

type Actions = Readonly<Record<string, ReactNode>>

export function Examples({ entry, locale, actions }: { entry: PagedComponent; locale: Locale; actions: Actions }) {
  const t = COMPONENT_PAGE_LABELS[locale]
  const { content } = entry
  return (
    <>
      <ul className={LIST}>
        {content.notes[locale].map((note) => <li key={note}><InlineText text={note} /></li>)}
      </ul>
      <ExampleKnobs labels={{ density: t.density, radius: t.radius, values: t.knobValues }} target={EXAMPLES_ID} />
      <div id={EXAMPLES_ID} style={{ '--tc-density': DENSITY[KNOB_DEFAULTS.density], '--tc-radius': RADIUS[KNOB_DEFAULTS.radius] }} className="grid min-w-0 gap-4">
        <div className={DEMO_GRID}>
          {content.demos.map((name) => <Example key={name} entry={entry} name={name} locale={locale} action={actions[name]} />)}
        </div>
      </div>
    </>
  )
}

function Example({ entry, name, locale, action }: { entry: PagedComponent; name: string; locale: Locale; action: ReactNode }) {
  const t = COMPONENT_PAGE_LABELS[locale]
  const key = `${entry.slug}/${name}`
  const rtl = name === 'rtl'
  const demo = action ?? <Demo demoKey={key} />
  return (
    <ExampleTabs
      caption={rtl ? <span className="text-sm text-muted">{t.rtlDemo}</span> : <span dir="ltr" className="font-mono text-sm text-muted">{name}</span>}
      label={t.demoTabs(entry.name)}
      names={{ preview: t.preview, code: t.code }}
      preview={
        <div className={`${STAGE} rounded-box`}>
          {rtl
            ? <div dir="rtl" lang="ar" className="min-w-0"><TopClassProvider direction="rtl" locale="ar">{demo}</TopClassProvider></div>
            : demo}
        </div>
      }
      code={<Code locale={locale} title={`${name}.tsx`} copyLabel={t.copyDemo(name, entry.name)} code={demoSourceOf(entry, name) ?? ''} />}
    />
  )
}
