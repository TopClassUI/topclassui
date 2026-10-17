// The catalog (page 13): the lead, Before you start, How to read a card, then the seven sections and their 46 cards.
import { CATALOG_LABELS } from '../../labels/catalog'
import { COMPONENT_PAGE_LABELS } from '../../labels/component-page'
import { type PagedComponent, SECTIONS, pagedComponentOf } from '../../lib/components'
import type { Locale } from '../../lib/locales'
import { H1, LEAD, SECTION, SMALL } from '../classes'
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
  const t = CATALOG_LABELS[locale]
  return [
    { group: t.startHere, items: [{ id: LEGEND_ID, text: t.legendTitle }, { id: BEFORE_ID, text: t.installHeading }] },
    { group: t.sectionsHeading, items: catalogSections().map((section) => ({ id: section.id, text: `${section.title[locale]} ${String(section.cards.length)}` })) },
  ]
}

export function CatalogPage({ locale }: { locale: Locale }) {
  const t = CATALOG_LABELS[locale]
  const anchor = COMPONENT_PAGE_LABELS[locale].anchor
  const sections = catalogSections()
  return (
    <article className="grid min-w-0 gap-7">
      <header className="grid min-w-0 gap-2.5">
        <h1 className={H1}>{t.title}</h1>
        <p className={LEAD}>{t.lead(sections.reduce((sum, section) => sum + section.cards.length, 0))}</p>
      </header>
      <BeforeYouStart id={BEFORE_ID} locale={locale} />
      <CardLegend id={LEGEND_ID} locale={locale} />
      {sections.map((section) => (
        <section key={section.id} aria-labelledby={section.id} data-section={section.id} className="grid min-w-0 gap-7">
          <div className={`${SECTION} pt-6.5`}>
            <SectionHeading id={section.id} anchorLabel={anchor(section.title[locale])}>{section.title[locale]}</SectionHeading>
            <p className={SMALL}>{t.sectionCount(section.cards.length)}</p>
            <p className={LEAD}>{section.lead[locale]}</p>
          </div>
          {section.cards.map((entry) => (
            <Previewer key={entry.slug} entry={entry} locale={locale} href={`/${locale}/docs/components/${entry.slug}`} headingId={`card-${entry.slug}`} />
          ))}
        </section>
      ))}
    </article>
  )
}
