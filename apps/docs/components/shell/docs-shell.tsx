import type { ReactNode } from 'react'
import { Breadcrumb } from 'topclassui/breadcrumb'
import { getLabels } from 'topclassui/labels/get-labels'

import { hrefOf, nextPage, previousPage, type Locale, type PageEntry } from '../../content/pages'
import type { SiteLabels } from '../../labels/index'
import { tocOf } from '../../lib/data'
import { SITE_URL } from '../../lib/site'
import { EXTERNAL_REL } from '../../lib/external'
import { GUIDE_LEAD, GUIDE_TITLE, TEXT_LINK } from '../classes'
import { Pager, type PageLink } from './next-card'
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

const linkOf = (page: PageEntry | undefined, locale: Locale): PageLink | undefined =>
  page === undefined ? undefined : { href: hrefOf(page, locale), title: page.title[locale] }

/** The lead, with the phrase the frame draws as a link made one. */
function leadOf(entry: PageEntry, locale: Locale): ReactNode {
  const lead = entry.description[locale]
  const link = entry.leadLink
  const at = link === undefined ? -1 : lead.indexOf(link.text)
  if (link === undefined || at === -1) return lead
  return <>{lead.slice(0, at)}<a href={link.href} rel={EXTERNAL_REL} dir="ltr" className={TEXT_LINK}>{link.text}</a>{lead.slice(at + link.text.length)}</>
}

/** A registry page in the columns: breadcrumb, h1, lead, sections, previous and next. */
export function DocsShell({ locale, entry, labels, children }: DocsShellProps) {
  const library = getLabels(locale)
  return (
    <DocsColumns locale={locale} current={entry.slug} labels={labels} toc={tocOf(locale, entry.slug)}>
      <article className="mx-auto flex max-w-(--docs-column) flex-col gap-8">
        <div className="flex flex-col gap-2.5">
          <Breadcrumb
            items={[{ label: labels.shell.home, href: `/${locale}` }, { label: entry.title[locale] }]}
            siteUrl={SITE_URL}
            {...library}
          />
          <h1 className={GUIDE_TITLE}>{entry.title[locale]}</h1>
          <p className={GUIDE_LEAD}>{leadOf(entry, locale)}</p>
        </div>
        {children}
        <Pager previous={linkOf(previousPage(entry.slug), locale)} next={linkOf(nextPage(entry.slug), locale)} labels={labels.shell} />
      </article>
    </DocsColumns>
  )
}
