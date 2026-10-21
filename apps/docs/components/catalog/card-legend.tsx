// How to read a card (page 13, frame 140:913): the five parts of every Previewer, numbered, side by side.
import { labelsFor } from '../../labels/index'
import { COMPONENT_PAGE_LABELS } from '../../labels/component-page'
import type { Locale } from '../../lib/locales'
import { CARD, IN_CARD_TITLE, LEGEND_NUMBER, NOTE, SMALL, STEP_TITLE } from '../classes'
import { SectionHeading } from '../section-heading'

export function CardLegend({ id, locale }: { id: string; locale: Locale }) {
  const t = labelsFor(locale).catalog
  return (
    <section aria-labelledby={id} className={`${CARD} scroll-mt-(--tc-sticky-top,0px)`}>
      <div className="grid min-w-0 gap-1.5 p-4.5">
        <SectionHeading id={id} className={IN_CARD_TITLE} anchorLabel={COMPONENT_PAGE_LABELS[locale].anchor(t.legendTitle)}>{t.legendTitle}</SectionHeading>
        <p className={SMALL}>{t.legendLead}</p>
      </div>
      <ol className="grid min-w-0 gap-y-4 pb-3.5 sm:grid-cols-2 lg:grid-cols-5">
        {t.legend.map((part, index) => (
          <li key={part.title} className={index === 0 ? 'grid content-start gap-1.5 px-3.5' : 'grid content-start gap-1.5 border-line px-3.5 lg:border-s-(length:--tc-line-width)'}>
            <div className="flex items-center gap-1.5">
              <span aria-hidden="true" className={LEGEND_NUMBER}>{index + 1}</span>
              <h3 className={STEP_TITLE}>{part.title}</h3>
            </div>
            <p className={NOTE}>{part.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
