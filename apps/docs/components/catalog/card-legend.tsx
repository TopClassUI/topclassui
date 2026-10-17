// How to read a card (page 13): the five parts of every Previewer, top to bottom.
import { CATALOG_LABELS } from '../../labels/catalog'
import { COMPONENT_PAGE_LABELS } from '../../labels/component-page'
import type { Locale } from '../../lib/locales'
import { CARD, CARD_HEAD, H3, SECTION, SMALL } from '../classes'
import { SectionHeading } from '../section-heading'

export function CardLegend({ id, locale }: { id: string; locale: Locale }) {
  const t = CATALOG_LABELS[locale]
  return (
    <section aria-labelledby={id} className={SECTION}>
      <SectionHeading id={id} anchorLabel={COMPONENT_PAGE_LABELS[locale].anchor(t.legendTitle)}>{t.legendTitle}</SectionHeading>
      <p className={SMALL}>{t.legendLead}</p>
      <ol className={`${CARD} ${CARD_HEAD} sm:grid-cols-2 lg:grid-cols-5`}>
        {t.legend.map((part, index) => (
          <li key={part.title} className="grid content-start gap-1">
            <span aria-hidden="true" className="font-mono text-sm text-primary-on-soft">{index + 1}</span>
            <h3 className={H3}>{part.title}</h3>
            <p className={SMALL}>{part.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
