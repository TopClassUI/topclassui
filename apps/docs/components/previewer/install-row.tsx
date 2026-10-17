// The install row (S8) with the release plan's defaults: the import line, and the one install command.
import { COMPONENT_PAGE_LABELS } from '../../labels/component-page'
import type { PagedComponent } from '../../lib/components'
import { INSTALL_LINE, importLineOf } from '../../lib/install'
import type { Locale } from '../../lib/locales'
import { CARD_PART, H3, INLINE_CODE, LINK, SMALL } from '../classes'
import { Code } from '../code'

export function InstallRow({ id, entry, locale }: { id: string; entry: PagedComponent; locale: Locale }) {
  const t = COMPONENT_PAGE_LABELS[locale]
  const names = entry.props.map((part) => part.name)
  return (
    <div id={id} className={`${CARD_PART} scroll-mt-(--tc-sticky-top,0px)`}>
      <h3 className={H3}>{t.importFromPackage}</h3>
      <Code locale={locale} title={`topclassui/${entry.slug}`} copyLabel={t.copyImport(entry.name)} code={importLineOf(names, entry.slug)} />
      <p className={`flex flex-wrap items-center gap-2 ${SMALL}`}>
        {t.installOnce}
        <a href={`/${locale}/docs/installation`} className={LINK}>
          <code dir="ltr" className={INLINE_CODE}>{INSTALL_LINE}</code>
        </a>
      </p>
    </div>
  )
}
