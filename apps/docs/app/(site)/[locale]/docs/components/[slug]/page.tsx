// A component's page (page 14), one per component with a content file, in both locales.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ComponentPage } from '../../../../../../components/component-page/component-page'
import { pagedComponentOf, pagedComponents } from '../../../../../../lib/components'
import { LOCALES, isLocale } from '../../../../../../lib/locales'

export const dynamicParams = false

export function generateStaticParams() {
  return pagedComponents().map((entry) => ({ slug: entry.slug }))
}

type Params = Promise<{ locale: string; slug: string }>

const pathOf = (locale: string, slug: string) => `/${locale}/docs/components/${slug}`

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params
  const entry = pagedComponentOf(slug)
  if (entry === null || !isLocale(locale)) return {}
  const title = locale === 'en'
    ? `React ${entry.content.title.en} - Tailwind CSS, RTL, accessible | TopClass UI`
    : `${entry.name} لـ React - Tailwind CSS، من اليمين إلى اليسار، سهل الوصول | TopClass UI`
  return {
    title,
    description: entry.content.description[locale],
    alternates: {
      canonical: pathOf(locale, slug),
      languages: { ...Object.fromEntries(LOCALES.map((other) => [other, pathOf(other, slug)])), 'x-default': pathOf('en', slug) },
    },
  }
}

export default async function Page({ params }: { params: Params }) {
  const { locale, slug } = await params
  const entry = pagedComponentOf(slug)
  if (entry === null || !isLocale(locale)) notFound()
  return <ComponentPage entry={entry} locale={locale} />
}
