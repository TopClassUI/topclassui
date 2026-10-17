// The catalog (page 13), in both locales: every card, in the seven sections.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CatalogPage } from '../../../../../components/catalog/catalog-page'
import { CATALOG_LABELS } from '../../../../../labels/catalog'
import { LOCALES, isLocale } from '../../../../../lib/locales'

const pathOf = (locale: string) => `/${locale}/docs/components`

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = CATALOG_LABELS[locale]
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
  return <CatalogPage locale={locale} />
}
