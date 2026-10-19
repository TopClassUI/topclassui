import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ComponentType } from 'react'
import type { MDXComponents } from 'mdx/types'

import { guideComponents } from '../../../../../components/guides/guide-map'
import { JsonLd } from '../../../../../components/json-ld'
import { mdxComponents } from '../../../../../components/mdx/mdx-map'
import { DocsShell } from '../../../../../components/shell/docs-shell'
import { SitePage } from '../../../../../components/shell/site-page'
import { LIVE_GUIDES, LOCALES, isLocale, pageBySlug, type Locale, type PageEntry } from '../../../../../content/pages'
import { labelsFor } from '../../../../../labels/index'
import { pageDate } from '../../../../../lib/data'
import { createMetadata } from '../../../../../lib/metadata'
import { guideArticleData } from '../../../../../lib/structured-data'

type Params = Promise<{ locale: string; page: string }>

export const dynamicParams = false

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => LIVE_GUIDES.map((page) => ({ locale, page: page.slug })))
}

function guideOf(locale: string, slug: string): { locale: Locale; entry: PageEntry } {
  const entry = pageBySlug(slug)
  if (!isLocale(locale) || entry?.kind !== 'guide') notFound()
  return { locale, entry }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, page } = await params
  const guide = guideOf(locale, page)
  return createMetadata(guide.entry, guide.locale)
}

/** A guide page from the registry and its MDX, in the docs shell. */
export default async function GuidePage({ params }: { params: Params }) {
  const { locale: raw, page } = await params
  const { locale, entry } = guideOf(raw, page)
  const { default: Content } = (await import(`../../../../../content/${locale}/${entry.slug}.mdx`)) as {
    default: ComponentType<{ components: MDXComponents }>
  }
  return (
    <SitePage locale={locale} current={entry.slug} path={entry.path}>
      <JsonLd data={guideArticleData(entry, locale, pageDate(entry.slug))} />
      <DocsShell locale={locale} entry={entry} labels={labelsFor(locale)}>
        <Content components={{ ...mdxComponents(locale), ...guideComponents(locale) }} />
      </DocsShell>
    </SitePage>
  )
}
