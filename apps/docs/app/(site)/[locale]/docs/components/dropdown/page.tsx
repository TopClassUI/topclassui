// The Dropdown page (page 14) on a route of its own: its data-driven demo defines a Server Action, and only this page carries that demo's client code.
import type { Metadata } from 'next'

import { actionDemosOf } from '../../../../../../components/action-demo'
import { ComponentRoute, componentMetadata } from '../../../../../../components/component-page/component-route'

const SLUG = 'dropdown'

export const dynamicParams = false

type Params = Promise<{ locale: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params
  return componentMetadata(locale, SLUG)
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params
  return <ComponentRoute locale={locale} slug={SLUG} actions={actionDemosOf(SLUG)} />
}
