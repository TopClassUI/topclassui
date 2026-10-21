// The catalog (page 13), in both locales: every card, in the seven sections.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CatalogPage, catalogCards, catalogTocEntries } from '../../../../../components/catalog/catalog-page'
import { JsonLd } from '../../../../../components/json-ld'
import { DocsColumns } from '../../../../../components/shell/docs-shell'
import { SitePage } from '../../../../../components/shell/site-page'
import { isLocale, pageBySlug, type Locale, type PageEntry } from '../../../../../content/pages'
import { labelsFor } from '../../../../../labels/index'
import { createMetadata } from '../../../../../lib/metadata'
import { catalogData } from '../../../../../lib/structured-data'

type Params = Promise<{ locale: string }>

function catalogOf(locale: string): { locale: Locale; entry: PageEntry } {
  const entry = pageBySlug('components')
  if (!isLocale(locale) || entry?.kind !== 'catalog') notFound()
  return { locale, entry }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, entry } = catalogOf((await params).locale)
  return createMetadata(entry, locale)
}

export default async function Page({ params }: { params: Params }) {
  const { locale, entry } = catalogOf((await params).locale)
  return (
    <SitePage locale={locale} current="components" path="/docs/components">
      <JsonLd data={catalogData(entry, locale, catalogCards())} />
      <DocsColumns locale={locale} current="components" labels={labelsFor(locale)} toc={catalogTocEntries(locale)}>
        <CatalogPage locale={locale} />
      </DocsColumns>
    </SitePage>
  )
}
