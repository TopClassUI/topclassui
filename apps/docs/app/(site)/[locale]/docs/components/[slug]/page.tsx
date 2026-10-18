// A component's page (page 14), one per component with a content file, in both locales; a page with an action demo has a route of its own.
import type { Metadata } from 'next'

import { ComponentRoute, componentMetadata, sharedRouteSlugs } from '../../../../../../components/component-page/component-route'

export const dynamicParams = false

export function generateStaticParams() {
  return sharedRouteSlugs().map((slug) => ({ slug }))
}

type Params = Promise<{ locale: string; slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params
  return componentMetadata(locale, slug)
}

export default async function Page({ params }: { params: Params }) {
  const { locale, slug } = await params
  return <ComponentRoute locale={locale} slug={slug} />
}
