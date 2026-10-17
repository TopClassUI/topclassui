// Examples (page 14, section 3): each demo a Preview and a Code tab, both in the HTML; the rtl one in Arabic.
import { TabsList, TabsPanel, TabsRoot, TabsTab } from 'topclassui/tabs'
import { TopClassProvider } from 'topclassui/provider'

import { COMPONENT_PAGE_LABELS } from '../../labels/component-page'
import { type PagedComponent, demoSourceOf } from '../../lib/components'
import type { Locale } from '../../lib/locales'
import { DEMO_GRID, LIST, STAGE } from '../classes'
import { Code } from '../code'
import { Demo } from '../demo'
import { InlineText } from '../inline-text'
import { ExampleKnobs } from './example-knobs'

export function Examples({ entry, locale }: { entry: PagedComponent; locale: Locale }) {
  const t = COMPONENT_PAGE_LABELS[locale]
  const { content } = entry
  return (
    <>
      <ul className={LIST}>
        {content.notes[locale].map((note) => <li key={note}><InlineText text={note} /></li>)}
      </ul>
      <ExampleKnobs labels={{ density: t.density, radius: t.radius, values: t.knobValues }}>
        <div className={DEMO_GRID}>
          {content.demos.map((name) => <Example key={name} entry={entry} name={name} locale={locale} />)}
        </div>
      </ExampleKnobs>
    </>
  )
}

function Example({ entry, name, locale }: { entry: PagedComponent; name: string; locale: Locale }) {
  const t = COMPONENT_PAGE_LABELS[locale]
  const key = `${entry.slug}/${name}`
  const rtl = name === 'rtl'
  const demo = <Demo demoKey={key} />
  return (
    <TabsRoot defaultValue="preview" size="sm" className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {rtl ? <span className="text-sm text-muted">{t.rtlDemo}</span> : <span dir="ltr" className="font-mono text-sm text-muted">{name}</span>}
        <TabsList aria-label={t.demoTabs(entry.name)}>
          <TabsTab value="preview">{t.preview}</TabsTab>
          <TabsTab value="code">{t.code}</TabsTab>
        </TabsList>
      </div>
      <TabsPanel value="preview" keepMounted className="min-w-0">
        <div className={`${STAGE} rounded-box`}>
          {rtl
            ? <div dir="rtl" lang="ar" className="min-w-0"><TopClassProvider direction="rtl" locale="ar">{demo}</TopClassProvider></div>
            : demo}
        </div>
      </TabsPanel>
      <TabsPanel value="code" keepMounted className="min-w-0">
        <Code locale={locale} title={`${name}.tsx`} copyLabel={t.copyDemo(name, entry.name)} code={demoSourceOf(entry, name) ?? ''} />
      </TabsPanel>
    </TabsRoot>
  )
}
