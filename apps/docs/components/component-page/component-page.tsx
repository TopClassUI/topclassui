// A component's page (page 14): head, the Previewer, examples, props, keyboard, RTL, server and client, related.
import type { ReactNode } from 'react'
import { Badge } from 'topclassui/badge'
import { Breadcrumb } from 'topclassui/breadcrumb'
import { getLabels } from 'topclassui/labels/get-labels'

import { COMPONENT_PAGE_LABELS, type ComponentPageLabels } from '../../labels/component-page'
import { chipOf } from '../../lib/chip'
import type { PagedComponent } from '../../lib/components'
import type { Locale } from '../../lib/locales'
import { SITE_URL } from '../../lib/site'
import { H1, LEAD, PROSE, SECTION } from '../classes'
import { InlineText } from '../inline-text'
import { Previewer } from '../previewer/previewer'
import { SectionHeading } from '../section-heading'
import { Examples } from './examples'
import { KeyboardTable } from './keyboard-table'
import { PropsTables } from './props-tables'
import { RelatedLinks } from './related-links'

/** The h2 ids are the same in both locales, so a link to #props works from either. */
export const SECTION_IDS = ['preview', 'examples', 'props', 'keyboard', 'rtl', 'server-and-client', 'related'] as const
type SectionId = (typeof SECTION_IDS)[number]

const headingOf = (id: SectionId, entry: PagedComponent, locale: Locale, t: ComponentPageLabels): string => ({
  preview: entry.content.title[locale],
  examples: t.sections.examples,
  props: t.sections.props,
  keyboard: t.sections.keyboard,
  rtl: t.sections.rtl,
  'server-and-client': t.sections.serverClient,
  related: t.sections.related,
})[id]

/** On this page for a component's page: every h2, in order (the shell's slot reads it). */
export function componentToc(entry: PagedComponent, locale: Locale): { id: string; text: string }[] {
  return SECTION_IDS.map((id) => ({ id, text: headingOf(id, entry, locale, COMPONENT_PAGE_LABELS[locale]) }))
}

/** `actions` holds the page's action demos, rendered by the one route that imports them (component-route.tsx). */
export function ComponentPage({ entry, locale, actions = {} }: { entry: PagedComponent; locale: Locale; actions?: Readonly<Record<string, ReactNode>> }) {
  const t = COMPONENT_PAGE_LABELS[locale]
  const { content } = entry
  const title = content.title[locale]
  const chip = chipOf(entry.rendering, entry.slug, t.chip)
  const files = ['index.tsx', ...(entry.files.client ? ['client.tsx'] : [])]
  const section = (id: Exclude<SectionId, 'preview'>, body: ReactNode) => (
    <section key={id} aria-labelledby={id} className={SECTION}>
      <SectionHeading id={id} anchorLabel={t.anchor(headingOf(id, entry, locale, t))}>{headingOf(id, entry, locale, t)}</SectionHeading>
      {body}
    </section>
  )
  return (
    <article className="mx-auto grid w-full max-w-(--docs-column) min-w-0 gap-8">
      <header className="grid min-w-0 gap-2.5">
        <Breadcrumb
          siteUrl={SITE_URL}
          labels={getLabels(locale).labels}
          items={[
            { href: `/${locale}`, label: t.home },
            { href: `/${locale}/docs/components`, label: t.components },
            { label: title },
          ]}
        />
        <h1 className={H1}>{title}</h1>
        <p className={LEAD}><InlineText text={content.description[locale]} /></p>
        <div><Badge tone="neutral" variant="outline" size="sm"><bdi>{chip}</bdi></Badge></div>
      </header>
      <Previewer entry={entry} locale={locale} headingId="preview" />
      {section('examples', <Examples entry={entry} locale={locale} actions={actions} />)}
      {section('props', <PropsTables entry={entry} locale={locale} />)}
      {section('keyboard', <KeyboardTable entry={entry} locale={locale} />)}
      {section('rtl', <p className={PROSE}><InlineText text={content.rtl[locale]} /></p>)}
      {section('server-and-client', (
        <div className="grid gap-1">
          <p className={PROSE}>{t.rendersOn[entry.rendering]}</p>
          <p className={PROSE}>{t.filesLine(files.join(', '))}</p>
          <p className={PROSE}>{t.sizeLine(chip)}</p>
        </div>
      ))}
      {section('related', <RelatedLinks entry={entry} locale={locale} />)}
    </article>
  )
}
