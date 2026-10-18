import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ComponentType } from 'react'
import type { MDXComponents } from 'mdx/types'

import { guideComponents } from '../../../../components/guides/guide-map'
import { JsonLd } from '../../../../components/json-ld'
import { mdxComponents } from '../../../../components/mdx/mdx-map'
import { DocsShell } from '../../../../components/shell/docs-shell'
import { SitePage } from '../../../../components/shell/site-page'
import { LIVE_PAGES, LOCALES, hrefOf, isLocale, type Locale, type PageEntry } from '../../../../content/pages'
import { labelsFor } from '../../../../labels/index'
import { pageDate } from '../../../../lib/data'
import { createMetadata } from '../../../../lib/metadata'
import { absolute } from '../../../../lib/site'

type Params = Promise<{ locale: string }>

export const dynamicParams = false

const entryOf = (): PageEntry | undefined => LIVE_PAGES.find((page) => page.kind === 'changelog')

export function generateStaticParams() {
  return entryOf() === undefined ? [] : LOCALES.map((locale) => ({ locale }))
}

function changelogOf(locale: string): { locale: Locale; entry: PageEntry } {
  const entry = entryOf()
  if (!isLocale(locale) || entry === undefined) notFound()
  return { locale, entry }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, entry } = changelogOf((await params).locale)
  return createMetadata(entry, locale)
}

/** The package's releases, then the version policy, in the docs shell (docs-site page 17). */
export default async function ChangelogPage({ params }: { params: Params }) {
  const { locale, entry } = changelogOf((await params).locale)
  const { default: Content } = (await import(`../../../../content/${locale}/changelog.mdx`)) as {
    default: ComponentType<{ components: MDXComponents }>
  }
  const modified = pageDate(entry.slug)
  return (
    <SitePage locale={locale} current={entry.slug} path={entry.path}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: entry.title[locale],
          description: entry.description[locale],
          inLanguage: locale,
          url: absolute(hrefOf(entry, locale)),
          ...(modified === null ? {} : { dateModified: modified }),
          publisher: { '@type': 'Organization', name: labelsFor(locale).meta.siteName },
        }}
      />
      <DocsShell locale={locale} entry={entry} labels={labelsFor(locale)}>
        <Content components={{ ...mdxComponents(locale), ...guideComponents(locale) }} />
      </DocsShell>
    </SitePage>
  )
}
