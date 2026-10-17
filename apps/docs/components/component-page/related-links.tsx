// Related (page 14, section 8): the section's other components, the content file's related ones, and the rule pages.
import { COMPONENT_PAGE_LABELS, RULE_PAGE_TITLES } from '../../labels/component-page'
import { type PagedComponent, pagedComponentOf, pagedComponents, sectionOf } from '../../lib/components'
import type { Locale } from '../../lib/locales'
import { H3, LINK } from '../classes'

export function RelatedLinks({ entry, locale }: { entry: PagedComponent; locale: Locale }) {
  const t = COMPONENT_PAGE_LABELS[locale]
  const section = sectionOf(entry)
  const peers = pagedComponents().filter((other) => other.section === entry.section && other.slug !== entry.slug)
  const related = entry.content.related.components
    .map((slug) => pagedComponentOf(slug))
    .filter((other): other is PagedComponent => other !== null && !peers.includes(other))
  const pages = entry.content.related.pages.filter((page) => page in RULE_PAGE_TITLES)
  const link = (other: PagedComponent) => (
    <li key={other.slug}><a href={`/${locale}/docs/components/${other.slug}`} className={LINK}>{other.content.title[locale]}</a></li>
  )
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {peers.length + related.length > 0 ? (
        <nav aria-label={t.sectionPeers(section?.title[locale] ?? '')} className="grid content-start gap-1">
          <h3 className={H3}>{t.sectionPeers(section?.title[locale] ?? '')}</h3>
          <ul className="grid gap-0.5">{[...peers, ...related].map(link)}</ul>
        </nav>
      ) : null}
      {pages.length > 0 ? (
        <nav aria-label={t.rulePages} className="grid content-start gap-1">
          <h3 className={H3}>{t.rulePages}</h3>
          <ul className="grid gap-0.5">
            {pages.map((page) => (
              <li key={page}><a href={`/${locale}/docs/${page}`} className={LINK}>{RULE_PAGE_TITLES[page]?.[locale]}</a></li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  )
}
