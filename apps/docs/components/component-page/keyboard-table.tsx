// Keyboard and accessibility (page 14, section 5): the keyboard table and the notes, from the content file.
import { Kbd } from 'topclassui/kbd'
import { Table } from 'topclassui/table'

import { COMPONENT_PAGE_LABELS } from '../../labels/component-page'
import type { PagedComponent } from '../../lib/components'
import type { Locale } from '../../lib/locales'
import { LIST, PROSE } from '../classes'
import { InlineText } from '../inline-text'

type Key = PagedComponent['content']['keyboard'][number]

export function KeyboardTable({ entry, locale }: { entry: PagedComponent; locale: Locale }) {
  const t = COMPONENT_PAGE_LABELS[locale]
  const { content } = entry
  return (
    <>
      {content.keyboard.length === 0 ? <p className={PROSE}>{t.noKeyboard}</p> : (
        <Table<Key>
          caption={t.keyboardCaption(entry.name)}
          items={content.keyboard}
          getKey={(row) => row.keys.join('+')}
          columns={[
            {
              key: 'keys',
              header: t.keys,
              rowHeader: true,
              cell: (row) => <span dir="ltr" className="inline-flex flex-wrap gap-1">{row.keys.map((key) => <Kbd key={key}>{key}</Kbd>)}</span>,
            },
            { key: 'action', header: t.action, cell: (row) => <InlineText text={row.action[locale]} />, className: 'whitespace-normal' },
          ]}
        />
      )}
      <ul className={LIST}>
        {content.accessibility[locale].map((note) => <li key={note}><InlineText text={note} /></li>)}
      </ul>
    </>
  )
}
