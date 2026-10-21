// The install row (S8) as the Previewer frames draw it: copy the source with the CLI, then import it from the copy.
import { COMPONENT_PAGE_LABELS } from '../../labels/component-page'
import type { PagedComponent } from '../../lib/components'
import { addLineOf, sourceImportLineOf } from '../../lib/install'
import type { Locale } from '../../lib/locales'
import { CAPTION, COPY_FIELD, COPY_FIELD_TEXT, INSTALL_COL, INSTALL_COL_END, INSTALL_ROW, NOTE } from '../classes'
import { CopyButton } from './previewer-islands'

interface FieldProps { heading: string; line: string; note: string; copyLabel: string; locale: Locale }

function CopyColumn({ heading, line, note, copyLabel, locale, className }: FieldProps & { className: string }) {
  const t = COMPONENT_PAGE_LABELS[locale]
  return (
    <div className={className}>
      <h3 className={CAPTION}>{heading}</h3>
      <div className={COPY_FIELD}>
        <code dir="ltr" translate="no" className={COPY_FIELD_TEXT}>{line}</code>
        <CopyButton text={line} label={copyLabel} copied={t.copied} failed={t.copyFailed} />
      </div>
      <p className={NOTE}>{note}</p>
    </div>
  )
}

export function InstallRow({ id, entry, locale }: { id: string; entry: PagedComponent; locale: Locale }) {
  const t = COMPONENT_PAGE_LABELS[locale]
  const names = entry.props.map((part) => part.name)
  return (
    <div id={id} className={`${INSTALL_ROW} scroll-mt-(--tc-sticky-top,0px)`}>
      <CopyColumn
        className={INSTALL_COL}
        locale={locale}
        heading={t.copySource}
        line={addLineOf(entry.slug)}
        note={t.copySourceNote}
        copyLabel={t.copyAdd(entry.name)}
      />
      <CopyColumn
        className={INSTALL_COL_END}
        locale={locale}
        heading={t.thenImport}
        line={sourceImportLineOf(names, entry.slug)}
        note={t.thenImportNote}
        copyLabel={t.copyImport(entry.name)}
      />
    </div>
  )
}
