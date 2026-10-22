// The catalog (page 13): the lead, Before you start, How to read a card, then the seven sections and their 46 cards.
import { labelsFor } from '../../labels/index'
import { COMPONENT_PAGE_LABELS } from '../../labels/component-page'
import { type PagedComponent, SECTIONS, pagedComponentOf } from '../../lib/components'
import type { Locale } from '../../lib/locales'
import { CHIP, H1, SECTION_H2, SMALL } from '../classes'
import { Previewer } from '../previewer/previewer'
import { SectionHeading } from '../section-heading'
import { BeforeYouStart } from './before-you-start'
import { CardLegend } from './card-legend'

export const BEFORE_ID = 'before-you-start'
export const LEGEND_ID = 'how-to-read-a-card'

/** The seven sections with their cards, in Figma's order; a slug without a page is a build error, not a hole. */
export function catalogSections() {
  return SECTIONS.map((section) => ({
    ...section,
    cards: section.slugs.map((slug) => {
      const entry = pagedComponentOf(slug)
      if (entry === null) throw new Error(`the catalog card ${slug} has no content file`)
      return entry
    }),
  }))
}

export const catalogCards = (): PagedComponent[] => catalogSections().flatMap((section) => section.cards)

/** On this page for the catalog: START HERE, then the seven sections with their counts (the shell's slot reads it). */
export function catalogToc(locale: Locale) {
  const t = labelsFor(locale).catalog
  return [
    { group: t.startHere, items: [{ id: LEGEND_ID, text: t.legendTitle }, { id: BEFORE_ID, text: t.installHeading }] },
    { group: t.sectionsHeading, items: catalogSections().map((section) => ({ id: section.id, text: section.title[locale], count: section.cards.length })) },
  ]
}

/** The groups as one list for On this page: each group's name on its first entry. */
export function catalogTocEntries(locale: Locale) {
  return catalogToc(locale).flatMap((group) => group.items.map((item, index) => (index === 0 ? { ...item, group: group.group } : item)))
}

export function CatalogPage({ locale }: { locale: Locale }) {
  const t = labelsFor(locale).catalog
  const anchor = COMPONENT_PAGE_LABELS[locale].anchor
  const sections = catalogSections()
  return (
    <article className="mx-auto grid w-full max-w-(--docs-column) min-w-0 gap-7">
      <header className="grid min-w-0 gap-2.5">
        <h1 className={H1}>{t.title}</h1>
        <p className="max-w-185 text-base text-muted">{t.lead(sections.reduce((sum, section) => sum + section.cards.length, 0))}</p>
      </header>
      <BeforeYouStart id={BEFORE_ID} locale={locale} />
      <CardLegend id={LEGEND_ID} locale={locale} />
      {sections.map((section) => (
        <section key={section.id} aria-labelledby={section.id} data-section={section.id} className="grid min-w-0 gap-7">
          <div className="grid min-w-0 scroll-mt-(--tc-sticky-top,0px) gap-2 pt-6.5">
            <div className="flex min-w-0 flex-wrap items-center gap-2.5">
              <SectionHeading id={section.id} className={SECTION_H2} anchorBefore anchorLabel={anchor(section.title[locale])}>{section.title[locale]}</SectionHeading>
              <span className={`${CHIP} bg-surface`}>{t.sectionCount(section.cards.length)}</span>
            </div>
            <p className={`${SMALL} max-w-190`}>{section.lead[locale]}</p>
            <hr className="w-25 border-line" />
          </div>
          {section.cards.map((entry) => (
            <Previewer key={entry.slug} entry={entry} locale={locale} href={`/${locale}/docs/components/${entry.slug}`} headingId={`card-${entry.slug}`} deferred />
          ))}
        </section>
      ))}
    </article>
  )
}
