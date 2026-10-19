// Examples (page 14, section 3): each demo a card in the Previewer's parts, its stage and its code; the rtl one in Arabic.
import type { ReactNode } from 'react'

import { COMPONENT_PAGE_LABELS } from '../../labels/component-page'
import { type PagedComponent, demoSourceOf } from '../../lib/components'
import { cleanSourceOf } from '../../lib/usage'
import { CopyButton } from '../previewer/previewer-islands'
import type { Locale } from '../../lib/locales'
import { CAPTION, CODE_PART, DEMO_GRID, FLAT_CODE, H3, LIST, PART_ROW, PREVIEWER, STAGE } from '../classes'
import { Code } from '../code'
import { Demo } from '../demo'
import { InlineText } from '../inline-text'
import { TopClassProvider } from '../shell/provider-island'
import { DENSITY, KNOB_DEFAULTS, RADIUS } from './knob-values'
import { ExampleKnobs, ExampleStage } from './page-islands'

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

/** One example as the Previewer card draws its parts: the name, the stage on the page background, then the code with its Copy.
 * No headings of its own: a demo may hold headings, and the section's h2 names them all. */
function Example({ entry, name, locale, action }: { entry: PagedComponent; name: string; locale: Locale; action: ReactNode }) {
  const t = COMPONENT_PAGE_LABELS[locale]
  const key = `${entry.slug}/${name}`
  const rtl = name === 'rtl'
  const demo = action ?? <Demo demoKey={key} />
  const source = cleanSourceOf(demoSourceOf(entry, name) ?? '')
  return (
    <article aria-label={`${entry.name}: ${name}`} className={PREVIEWER}>
      <div className="p-4.5">
        {rtl ? <p data-example-name={name} className={CAPTION}>{t.rtlDemo}</p> : <p data-example-name={name} dir="ltr" className={`${CAPTION} text-start font-mono`}>{name}</p>}
      </div>
      <div data-example-stage="" className={`${STAGE} min-h-40 border-t-(length:--tc-line-width) border-line`}>
        <ExampleStage
          stage={rtl
            ? <div dir="rtl" lang="ar" className="min-w-0"><TopClassProvider direction="rtl" locale="ar">{demo}</TopClassProvider></div>
            : demo}
        />
      </div>
      <div className={CODE_PART}>
        <div className={PART_ROW}>
          <p className={H3}>{t.theCode}</p>
          <CopyButton text={source} label={t.copyDemo(name, entry.name)} word={t.copy} copied={t.copied} failed={t.copyFailed} />
        </div>
        <Code locale={locale} title={`${name}.tsx`} copyLabel={t.copyDemo(name, entry.name)} code={source} className={FLAT_CODE} />
      </div>
    </article>
  )
}
