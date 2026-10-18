import Link from 'next/link'
import { Badge } from 'topclassui/badge'
import { Button } from 'topclassui/button'
import { CodeBlock } from 'topclassui/code-block'
import { Icon } from 'topclassui/icon'
import { getLabels } from 'topclassui/labels/get-labels'
import { Separator } from 'topclassui/separator'

import { LIVE_PAGES, PAGE_GROUPS, hrefOf, type Locale } from '../../content/pages'
import type { SiteLabels } from '../../labels/index'
import { CARDS } from '../../lib/data'
import { GITHUB_URL, INSTALL_LINE, PRERELEASE, VERSION } from '../../lib/site'
import { QUIET_LINK } from '../classes'

/** Five columns as drawn; a column whose pages are not live yet is left out, never greyed (choice 12). */
export function SiteFooter({ locale, labels }: { locale: Locale; labels: SiteLabels }) {
  const columns = PAGE_GROUPS.map((group) => ({
    group,
    pages: LIVE_PAGES.filter((page) => page.group === group && page.kind !== 'home'),
  })).filter((column) => column.pages.length > 0)
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-(--docs-home) flex-col gap-10 px-4 py-10 md:flex-row md:px-10">
        <div className="flex max-w-sm flex-col gap-3">
          <p className="flex items-center gap-2 text-base font-semibold text-body">
            <Icon name="palette" />
            {labels.meta.siteName}
          </p>
          <p className="text-sm font-medium text-body">{labels.footer.tagline}</p>
          <p className="text-sm text-muted">{labels.footer.blurb(CARDS.length)}</p>
          <ul className="flex flex-wrap gap-2">
            <li><Badge tone="neutral">{labels.footer.license}</Badge></li>
            <li><Badge tone="neutral"><bdi>{labels.footer.version(VERSION, PRERELEASE)}</bdi></Badge></li>
            <li><Badge tone="neutral">{labels.footer.wcag}</Badge></li>
          </ul>
          <CodeBlock lang="bash" title={labels.footer.install} {...getLabels(locale)}>{INSTALL_LINE}</CodeBlock>
          {GITHUB_URL === null ? null : (
            <Button variant="outline" tone="neutral" size="sm" render={<a href={GITHUB_URL} />}>
              <Icon name="github-logo" />
              {labels.home.hero.star}
            </Button>
          )}
        </div>
        {columns.map((column) => (
          <nav key={column.group} aria-label={labels.footer.columns[column.group]} className="flex min-w-40 flex-col gap-2">
            <p className="text-sm font-semibold text-body">{labels.footer.columns[column.group]}</p>
            <ul className="flex flex-col gap-1 text-sm">
              {column.pages.map((page) => (
                <li key={page.slug}>
                  <Link href={hrefOf(page, locale)} className={QUIET_LINK}>{page.title[locale]}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <Separator />
      <div className="mx-auto flex max-w-(--docs-home) flex-wrap items-center justify-between gap-4 px-4 py-5 text-sm text-muted md:px-10">
        <p>{labels.footer.bottom}</p>
        {GITHUB_URL === null ? null : <a href={GITHUB_URL} className={QUIET_LINK}>{labels.shell.github}</a>}
      </div>
    </footer>
  )
}
