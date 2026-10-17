// One demo alone at a stable address (S9), plus the reserved blank/empty baseline for the size test.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Demo, isDemoKey } from '../../../../../../../components/demo'
import { BLANK, previewDemos } from '../../../../../../../lib/preview'

export const dynamicParams = false

export function generateStaticParams() {
  return [...previewDemos(), BLANK]
}

type Params = Promise<{ component: string; demo: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { component, demo } = await params
  return { title: `${component}/${demo}` }
}

export default async function PreviewPage({ params }: { params: Params }) {
  const { component, demo } = await params
  const key = `${component}/${demo}`
  // Named for axe and for a screenshot's reader; hidden, so the picture is the demo alone.
  const heading = <h1 className="sr-only">{key}</h1>
  if (component === BLANK.component && demo === BLANK.demo) return heading
  if (!isDemoKey(key)) notFound()
  return <>{heading}<Demo demoKey={key} /></>
}
