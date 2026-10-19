import Link from 'next/link'
import { Button } from 'topclassui/button'
import { BORDER, HOVER, ICON_BUTTON } from 'topclassui/classes'
import { Icon } from 'topclassui/icon'
import { Separator } from 'topclassui/separator'

import { LIVE_PAGES, PAGE_GROUPS, hrefOf, pageBySlug, type Locale } from '../../content/pages'
import type { SiteLabels } from '../../labels/index'
import { EXTERNAL_REL } from '../../lib/external'
import { CARDS } from '../../lib/data'
import { GITHUB_URL, INSTALL_LINE, PRERELEASE, VERSION, X_URL, YOUTUBE_URL } from '../../lib/site'
import { QUIET_LINK } from '../classes'
import { CommandBox } from '../command-box'
import { GithubMark, XMark, YoutubeMark } from '../home/brand-logos'
import { BrandTile } from './brand-mark'

const FACT = `rounded-chip bg-page px-2 py-0.5 font-mono text-xs text-muted ${BORDER}`

/** Five columns as drawn: the brand, then one per page group; a column whose pages are not live yet is left out (choice 12). */
export function SiteFooter({ locale, labels }: { locale: Locale; labels: SiteLabels }) {
  const columns = PAGE_GROUPS.map((group) => ({
    group,
    links: [
      ...LIVE_PAGES.filter((page) => page.group === group && page.kind !== 'home').map((page) => ({ key: page.slug, href: hrefOf(page, locale), text: page.title[locale] })),
      ...(group === 'more' ? [{ key: 'llms', href: '/llms.txt', text: labels.footer.llms }] : []),
    ],
  })).filter((column) => column.links.length > 0)
  const changelog = pageBySlug('changelog')
  const social = [
    { key: 'github', url: GITHUB_URL, name: labels.shell.github, Mark: GithubMark },
    { key: 'youtube', url: YOUTUBE_URL, name: labels.shell.youtube, Mark: YoutubeMark },
    { key: 'x', url: X_URL, name: labels.home.follow.x.name, Mark: XMark },
  ]
  return (
    <footer className="border-t border-line bg-surface">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 px-4 py-10 md:grid-cols-4 md:px-10 lg:grid-cols-[25rem_repeat(4,minmax(0,1fr))] lg:gap-12">
        <div className="col-span-full flex max-w-md flex-col gap-3 lg:col-span-1">
          <p className="flex items-center gap-2 text-base font-semibold text-body">
            <BrandTile />
            {labels.meta.siteName}
          </p>
          <p className="text-sm font-medium text-body">{labels.footer.tagline}</p>
          <p className="text-xs text-muted">{labels.footer.blurb(CARDS.length)}</p>
          <ul className="flex flex-wrap gap-1.5">
            <li className={FACT}>{labels.footer.license}</li>
            <li className={FACT}><bdi>{labels.footer.version(VERSION, PRERELEASE)}</bdi></li>
            <li className={FACT}>{labels.footer.wcag}</li>
          </ul>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <CommandBox code={INSTALL_LINE} locale={locale} size="sm" className="w-fit" />
            {GITHUB_URL === null ? null : (
              <Button size="sm" render={<a href={GITHUB_URL} rel={EXTERNAL_REL} />}>
                <Icon name="github-logo" />
                {labels.home.hero.star}
              </Button>
            )}
          </div>
        </div>
        {columns.map((column) => (
          <nav key={column.group} aria-label={labels.footer.columns[column.group]} className="flex min-w-0 flex-col gap-1.5">
            <p className="text-xs font-semibold text-body">{labels.footer.columns[column.group]}</p>
            <ul className="flex flex-col text-xs">
              {column.links.map((link) => (
                <li key={link.key}>
                  <Link href={link.href} className={QUIET_LINK}>{link.text}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <Separator />
      <div className="flex flex-wrap items-center gap-3 px-4 py-4 text-xs text-muted md:px-10">
        <p className="me-auto">{labels.footer.bottom}</p>
        <ul aria-label={labels.footer.social} className="flex items-center gap-1">
          {social.map(({ key, url, name, Mark }) => (url === null ? null : (
            <li key={key}>
              <a href={url} rel={EXTERNAL_REL} aria-label={name} className={`${ICON_BUTTON} ${HOVER.ghost} text-muted`}><Mark /></a>
            </li>
          )))}
        </ul>
        {changelog === undefined ? null : <Link href={hrefOf(changelog, locale)} className={QUIET_LINK}>{changelog.title[locale]}</Link>}
      </div>
    </footer>
  )
}
