// The catalog (page 13), in both locales: every card, in the seven sections.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CatalogPage, catalogToc } from '../../../../../components/catalog/catalog-page'
import { DocsColumns } from '../../../../../components/shell/docs-shell'
import { SitePage } from '../../../../../components/shell/site-page'
import { labelsFor } from '../../../../../labels/index'
import { LOCALES, isLocale } from '../../../../../lib/locales'

const pathOf = (locale: string) => `/${locale}/docs/components`

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = labelsFor(locale).catalog
  return {
    title: t.metaTitle,
    description: t.description,
    alternates: {
      canonical: pathOf(locale),
      languages: { ...Object.fromEntries(LOCALES.map((other) => [other, pathOf(other)])), 'x-default': pathOf('en') },
    },
  }
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return (
    <SitePage locale={locale} current="components" path="/docs/components">
      <DocsColumns locale={locale} current="components" labels={labelsFor(locale)} toc={catalogToc(locale).flatMap((group) => group.items)}>
        <CatalogPage locale={locale} />
      </DocsColumns>
    </SitePage>
  )
}
