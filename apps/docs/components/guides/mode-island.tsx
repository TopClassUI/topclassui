import { Button } from 'topclassui/button'
import { BORDER } from 'topclassui/classes'
import { Input } from 'topclassui/input'

import type { Locale } from '../../content/pages'
import { guideLabelsFor } from '../../labels/guides'

/** The same Button and Input twice: in the page's mode, and inside one `data-theme` section (docs-site page 9). */
export function ModeIsland({ mode, locale }: { mode: 'light' | 'dark' | 'ocean'; locale: Locale }) {
  const labels = guideLabelsFor(locale).island
  const pair = (
    <div className="flex flex-wrap items-center gap-3">
      <Input type="email" aria-label={labels.email} placeholder={labels.email} />
      <Button type="button">{labels.save}</Button>
    </div>
  )
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <figure className={`flex flex-col gap-3 rounded-box bg-page p-4 ${BORDER}`}>
        <figcaption className="text-sm text-muted">{labels.page}</figcaption>
        {pair}
      </figure>
      <figure data-theme={mode} className={`flex flex-col gap-3 rounded-box bg-page p-4 text-body ${BORDER}`}>
        <figcaption dir="ltr" className="font-mono text-sm text-muted">{labels.scoped}</figcaption>
        {pair}
      </figure>
    </div>
  )
}
