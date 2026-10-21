import { BORDER } from 'topclassui/classes'
import { Icon } from 'topclassui/icon'

import type { Locale } from '../../content/pages'
import type { SiteLabels } from '../../labels'
import { ADD_LINE } from '../../lib/site'
import { CommandBox } from '../command-box'

const IMPORT_LINE = "import { Button } from 'topclassui/button'"
/** The drawn 210 px card, its code row a borderless well on the page colour. */
const CARD = `flex min-h-52.5 min-w-0 flex-col gap-3 rounded-box bg-surface p-6.5 text-start ${BORDER}`

/** The two ways in, side by side: copy the source with the CLI, or import from the package. */
export function InstallCard({ locale, labels }: { locale: Locale; labels: SiteLabels }) {
  const text = labels.home.install
  const ways = [
    { key: 'copy', icon: 'terminal-window', code: ADD_LINE, ...text.copy },
    { key: 'import', icon: 'download-simple', code: IMPORT_LINE, ...text.import },
  ] as const
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {ways.map((way) => (
        <div key={way.key} className={CARD}>
          <h3 className="flex items-center gap-2.5 text-xl font-semibold text-body">
            <span className="text-primary-on-soft"><Icon name={way.icon} size="1.25rem" /></span>
            {way.title}
          </h3>
          <CommandBox code={way.code} locale={locale} bare />
          <p className="text-sm text-muted">{way.note}</p>
        </div>
      ))}
    </div>
  )
}
