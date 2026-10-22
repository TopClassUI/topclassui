import Link from 'next/link'
import { Button } from 'topclassui/button'
import { BORDER, HOVER, ICON_BUTTON } from 'topclassui/classes'
import { Icon } from 'topclassui/icon'
import { Separator } from 'topclassui/separator'

import { LIVE_PAGES, PAGE_GROUPS, hrefOf, pageBySlug, type Locale } from '../../content/pages'
import type { SiteLabels } from '../../labels/index'
import { SECTIONS } from '../../content/sections'
import { EXTERNAL_REL } from '../../lib/external'
import { CARDS } from '../../lib/data'
import { GITHUB_URL, INSTALL_LINE, PRERELEASE, VERSION, X_URL, YOUTUBE_URL } from '../../lib/site'
import { QUIET_LINK, TYPE } from '../classes'
import { CommandBox } from '../command-box'
import { GithubMark, XMark, YoutubeMark } from '../home/brand-logos'
import { BrandTile } from './brand-mark'

/** The catalog sections the footer's Components column lists, as drawn. */
const FOOTER_SECTIONS = ['actions', 'forms', 'overlays', 'navigation', 'data'] as const

/** The tagline and the description on the frame's own lines, 17 and 15 px, so the brand column is the drawn 187 px. */
const TAGLINE = 'text-sm leading-[1.0625rem] font-medium text-body'
const BLURB = 'text-xs leading-[0.9375rem] text-muted'

/** A fact chip as drawn: 20 px, 9 px mono on the page colour. */
const FACT = `rounded-chip bg-page px-2 py-0.75 font-mono text-[0.5625rem] leading-3 text-muted ${BORDER}`

/** The drawn 29 px Star button: 12 px text, a 14 px icon 6 px before it; 11 px of padding inside the Button's 1 px transparent edge make the drawn 12. */
const STAR = 'h-[1.8125rem] gap-1.5 px-[0.6875rem] text-xs'

/** The install line and the Star button on one row in the 360 px column; only a phone narrower than both lets the button drop, rather than cutting either. */
const INSTALL_ROW = 'flex flex-wrap items-center gap-2 pt-1 sm:flex-nowrap'

/** A link column: 24 px targets stacked flush, 4 px under the 16 px heading, keep the drawn 24 px pitch of 15 px lines 9 px apart. */
const COLUMN = 'flex min-w-0 flex-col gap-1'

/** The bottom row: 14 px around its 24 px targets is the drawn 18 px around 16 px icons, 52 px in all. */
const BOTTOM = 'flex flex-wrap items-center gap-3 px-4 py-3.5 text-xs text-muted md:px-10'

/** The social icons the drawn 14 px apart and 12 px from their neighbours: 6 px between 24 px targets, the row pulled out by the 4 px each adds. */
const SOCIAL = '-mx-1 flex items-center gap-1.5'

/** Five columns as drawn: the brand, then one per page group, the catalog's sections under Components; a page not live yet is left out (choice 12). */
export function SiteFooter({ locale, labels }: { locale: Locale; labels: SiteLabels }) {
  const catalog = pageBySlug('components')
  const catalogHref = catalog === undefined ? '' : hrefOf(catalog, locale)
  const columns = PAGE_GROUPS.map((group) => ({
    group,
    links: [
      ...(group === 'more' ? [{ key: 'llms', href: '/llms.txt', text: labels.footer.llms }] : []),
      // The frame lists the CLI last in Get started.
      ...LIVE_PAGES.filter((page) => page.group === group && page.kind !== 'home').sort((a, b) => Number(a.slug === 'cli') - Number(b.slug === 'cli')).map((page) => ({
        key: page.slug,
        href: hrefOf(page, locale),
        text: page.slug === 'components' ? labels.footer.all(CARDS.length) : page.slug === 'cli' ? labels.footer.cli : page.title[locale],
      })),
      ...(group === 'reference' ? FOOTER_SECTIONS.map((id) => SECTIONS.find((section) => section.id === id)).filter((section) => section !== undefined).map((section) => ({ key: section.id, href: `${catalogHref}#${section.id}`, text: section.title[locale] })) : []),
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
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 px-4 py-10 md:grid-cols-4 md:px-10 lg:grid-cols-[22.5rem_repeat(4,minmax(0,1fr))] lg:gap-12">
        <div className="col-span-full flex max-w-90 flex-col gap-3 lg:col-span-1">
          <p className={`flex items-center gap-2 font-semibold text-body ${TYPE.name}`}>
            <BrandTile className="size-6" mark="0.875rem" />
            {labels.meta.siteName}
          </p>
          <p className={TAGLINE}>{labels.footer.tagline}</p>
          <p className={BLURB}>{labels.footer.blurb(CARDS.length)}</p>
          <ul className="flex flex-wrap gap-1.5">
            <li className={FACT}>{labels.footer.license}</li>
            <li className={FACT}><bdi>{labels.footer.version(VERSION.split('-')[0] ?? VERSION, PRERELEASE)}</bdi></li>
            <li className={FACT}>{labels.footer.wcag}</li>
          </ul>
          <div className={INSTALL_ROW}>
            <CommandBox code={INSTALL_LINE} locale={locale} size="sm" className="w-fit" />
            {GITHUB_URL === null ? null : (
              <Button size="custom" className={STAR} render={<a href={GITHUB_URL} rel={EXTERNAL_REL} />}>
                <Icon name="github-logo" size="0.875rem" />
                {labels.home.hero.star}
              </Button>
            )}
          </div>
        </div>
        {columns.map((column) => (
          <nav key={column.group} aria-label={labels.footer.columns[column.group]} className={COLUMN}>
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
      <div className={BOTTOM}>
        <p className="me-auto">{labels.footer.bottom}</p>
        <ul aria-label={labels.footer.social} className={SOCIAL}>
          {social.map(({ key, url, name, Mark }) => (url === null ? null : (
            <li key={key}>
              <a href={url} rel={EXTERNAL_REL} aria-label={name} className={`${ICON_BUTTON} ${HOVER.ghost} text-muted`}><Mark /></a>
            </li>
          )))}
        </ul>
        {changelog === undefined ? null : <Link href={hrefOf(changelog, locale)} className={QUIET_LINK}>{changelog.title[locale]}</Link>}
        {GITHUB_URL === null ? null : <a href={GITHUB_URL} rel="noopener noreferrer" className={QUIET_LINK}>{labels.shell.github}</a>}
      </div>
    </footer>
  )
}
