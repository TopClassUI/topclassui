import type { ComponentType } from 'react'
import { BORDER } from 'topclassui/classes'

import { DEMOS } from '../../.generated/demos'
import type { Locale } from '../../content/pages'
import { guideLabelsFor } from '../../labels/guides'

type DemoKey = keyof typeof DEMOS

async function demoOf(key: string): Promise<ComponentType> {
  if (!(key in DEMOS)) throw new Error(`no demo ${key} in .generated/demos.ts`)
  return ((await DEMOS[key as DemoKey]()) as { default: ComponentType }).default
}

/** One component's demo left to right beside its rtl demo, both from the library's dummy/ files in dist (docs-site page 10). */
export async function DirectionPair({ ltr, rtl, locale }: { ltr: string; rtl: string; locale: Locale }) {
  const labels = guideLabelsFor(locale).pair
  const [Ltr, Rtl] = await Promise.all([demoOf(ltr), demoOf(rtl)])
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <figure dir="ltr" lang="en" className={`flex min-w-0 flex-col gap-3 rounded-box bg-page p-4 ${BORDER}`}>
        <figcaption className="font-mono text-sm text-muted">{labels.ltr}</figcaption>
        <Ltr />
      </figure>
      <figure className={`flex min-w-0 flex-col gap-3 rounded-box bg-page p-4 ${BORDER}`}>
        <figcaption dir="ltr" className="font-mono text-sm text-muted">{labels.rtl}</figcaption>
        <Rtl />
      </figure>
    </div>
  )
}
