// What a component's page route renders and says about itself, shared by [slug] and the routes of the pages with an action demo.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { ACTION_DEMO_KEYS } from '../../.generated/server-demos'
import { labelsFor } from '../../labels/index'
import { componentDate } from '../../lib/data'
import { ACTION_ROUTES, pagedComponentOf, pagedComponents } from '../../lib/components'
import { isLocale } from '../../lib/locales'
import { createMetadata } from '../../lib/metadata'
import { componentArticleData } from '../../lib/structured-data'
import { JsonLd } from '../json-ld'
import { DocsColumns } from '../shell/docs-shell'
import { SitePage } from '../shell/site-page'
import { ComponentPage, componentToc } from './component-page'

export { ACTION_ROUTES }

const hasActionDemos = (slug: string) => ACTION_DEMO_KEYS.some((key) => key.startsWith(`${slug}/`))

/** The slugs [slug] builds: every paged component but the ones with a route of their own. */
export function sharedRouteSlugs(): string[] {
  return pagedComponents().map((entry) => entry.slug).filter((slug) => {
    if (!hasActionDemos(slug)) return true
    if ((ACTION_ROUTES as readonly string[]).includes(slug)) return false
    throw new Error(`${slug} has a demo with a Server Action: give it a route of its own and add it to ACTION_ROUTES`)
  })
}

export function componentMetadata(locale: string, slug: string): Metadata {
  const entry = pagedComponentOf(slug)
  if (entry === null || !isLocale(locale)) return {}
  return createMetadata(entry, locale)
}

export function ComponentRoute({ locale, slug, actions = {} }: { locale: string; slug: string; actions?: Readonly<Record<string, ReactNode>> }) {
  const entry = pagedComponentOf(slug)
  if (entry === null || !isLocale(locale)) notFound()
  return (
    <SitePage locale={locale} current="components" path={`/docs/components/${slug}`}>
      <JsonLd data={componentArticleData(entry, locale, componentDate(slug))} />
      <DocsColumns locale={locale} current="components" labels={labelsFor(locale)} toc={componentToc(entry, locale)}>
        <ComponentPage entry={entry} locale={locale} actions={actions} />
      </DocsColumns>
    </SitePage>
  )
}
