import { BORDER } from 'topclassui/classes'

import type { Locale } from '../../content/pages'
import { guideLabelsFor } from '../../labels/guides'
import { Demo, isDemoKey } from '../demo'

function demoOf(key: string) {
  if (!isDemoKey(key)) throw new Error(`no demo ${key} in .generated/demos.ts`)
  return <Demo demoKey={key} />
}

/** One component's demo left to right beside its rtl demo, both from the library's dummy/ files in dist (docs-site page 10). */
export function DirectionPair({ ltr, rtl, locale }: { ltr: string; rtl: string; locale: Locale }) {
  const labels = guideLabelsFor(locale).pair
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <figure dir="ltr" lang="en" className={`flex min-w-0 flex-col gap-3 rounded-box bg-page p-4 ${BORDER}`}>
        <figcaption className="font-mono text-sm text-muted">{labels.ltr}</figcaption>
        {demoOf(ltr)}
      </figure>
      <figure className={`flex min-w-0 flex-col gap-3 rounded-box bg-page p-4 ${BORDER}`}>
        <figcaption dir="ltr" className="font-mono text-sm text-muted">{labels.rtl}</figcaption>
        {demoOf(rtl)}
      </figure>
    </div>
  )
}
