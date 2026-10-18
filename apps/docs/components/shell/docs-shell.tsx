import type { ReactNode } from 'react'
import { Breadcrumb } from 'topclassui/breadcrumb'
import { getLabels } from 'topclassui/labels/get-labels'

import { hrefOf, nextPage, type Locale, type PageEntry } from '../../content/pages'
import type { SiteLabels } from '../../labels/index'
import { tocOf } from '../../lib/data'
import { SITE_URL } from '../../lib/site'
import { NextCard } from './next-card'
import { OnThisPage, type TocEntry } from './on-this-page'
import { SiteSidebar } from './site-sidebar'

export interface DocsShellProps {
  locale: Locale
  entry: PageEntry
  labels: SiteLabels
  children: ReactNode
}

export interface DocsColumnsProps {
  locale: Locale
  /** The registry slug the sidebar marks current. */
  current: string
  labels: SiteLabels
  toc: readonly TocEntry[]
  children: ReactNode
}

/** The three columns of every docs page: the sidebar, main and On this page. */
export function DocsColumns({ locale, current, labels, toc, children }: DocsColumnsProps) {
  return (
    <div className="mx-auto grid w-full max-w-360 grid-cols-1 lg:grid-cols-[var(--docs-sidebar)_minmax(0,1fr)] xl:grid-cols-[var(--docs-sidebar)_minmax(0,1fr)_var(--docs-toc)]">
      <SiteSidebar locale={locale} current={current} labels={labels} />
      <main id="main" tabIndex={-1} className="min-w-0 px-4 pt-9 pb-14 outline-none md:px-11">
        {children}
      </main>
      <OnThisPage entries={toc} label={labels.shell.onThisPage} />
    </div>
  )
}

/** A registry page in the columns: breadcrumb, h1, lead, sections and next. */
export function DocsShell({ locale, entry, labels, children }: DocsShellProps) {
  const next = nextPage(entry.slug)
  const library = getLabels(locale)
  return (
    <DocsColumns locale={locale} current={entry.slug} labels={labels} toc={tocOf(locale, entry.slug)}>
      <article className="mx-auto flex max-w-(--docs-column) flex-col gap-8">
        <div className="flex flex-col gap-2.5">
          <Breadcrumb
            items={[{ label: labels.shell.home, href: `/${locale}` }, { label: entry.title[locale] }]}
            baseUrl={SITE_URL}
            {...library}
          />
          <h1 className="text-4xl font-semibold text-body">{entry.title[locale]}</h1>
          <p className="text-base text-muted">{entry.description[locale]}</p>
        </div>
        {children}
        {next === undefined ? null : <NextCard href={hrefOf(next, locale)} title={next.title[locale]} label={labels.shell.next} />}
      </article>
    </DocsColumns>
  )
}
