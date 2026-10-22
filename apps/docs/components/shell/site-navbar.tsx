import Link from 'next/link'
import { getLabels } from 'topclassui/labels/get-labels'
import { Icon } from 'topclassui/icon'
import { NavbarActions, NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot } from 'topclassui/navbar'
import { HOVER, ICON_BUTTON } from 'topclassui/classes'

import { LIVE_GUIDES, hrefOf, pageBySlug, type Locale } from '../../content/pages'
import type { SiteLabels } from '../../labels/index'
import { EXTERNAL_REL } from '../../lib/external'
import { GITHUB_URL } from '../../lib/site'
import { LanguageSwitch } from './language-switch'
import { MobileMenu, ModeSwitch, SearchButton } from './shell-islands'
import { BrandTile } from './brand-mark'
import { SidebarGroups } from './sidebar-groups'

export interface SiteNavbarProps {
  locale: Locale
  /** The registry slug of the page being read, for aria-current. */
  current: string
  /** The path after the locale, so the language switch keeps the page. */
  path: string
  labels: SiteLabels
}

/** Docs, then Components, Icons and Theming once each page is live: a link to nothing is left out (choice 12). */
function navLinks(locale: Locale, labels: SiteLabels) {
  const first = LIVE_GUIDES[0]
  const links = [first === undefined ? null : { key: 'docs', href: hrefOf(first, locale), text: labels.shell.docs, slugs: LIVE_GUIDES.map((page) => page.slug) }]
  for (const slug of ['components', 'icons', 'theming']) {
    const page = pageBySlug(slug)
    if (page !== undefined) links.push({ key: slug, href: hrefOf(page, locale), text: page.title[locale], slugs: [slug] })
  }
  return links.filter((link) => link !== null)
}

/** The mode, the language and GitHub: in the bar from 40rem, and in the menu's footer below it, so a phone's bar keeps one row. */
function ShellSettings({ locale, path, labels }: Omit<SiteNavbarProps, 'current'>) {
  return (
    <>
        <ModeSwitch label={labels.mode.label} names={{ light: labels.mode.light, dark: labels.mode.dark, ocean: labels.mode.ocean }} />
        <LanguageSwitch locale={locale} path={path} label={labels.language.label} />
        {GITHUB_URL === null ? null : (
          <a href={GITHUB_URL} rel={EXTERNAL_REL} className={`${ICON_BUTTON} ${HOVER.ghost} text-muted`} aria-label={labels.shell.github}>
            <Icon name="github-logo" />
          </a>
        )}
    </>
  )
}

export function SiteNavbar({ locale, current, path, labels }: SiteNavbarProps) {
  const library = getLabels(locale)
  return (
    <NavbarRoot className="bg-surface min-h-14.5 ps-[calc(1.75rem+var(--tc-safe-start))] pe-[calc(1.75rem+var(--tc-safe-end))]">
      <NavbarBrand render={<Link href={`/${locale}`} />}>
        <BrandTile />
        <span>{labels.meta.siteName}</span>
      </NavbarBrand>
      <NavbarLinks labels={library.labels} aria-label={labels.shell.sectionsNav} className="max-md:hidden">
        {navLinks(locale, labels).map((link) => (
          <NavbarLink key={link.key} render={<Link href={link.href} />} current={link.slugs.includes(current)}>
            {link.text}
          </NavbarLink>
        ))}
      </NavbarLinks>
      <NavbarActions>
        <SearchButton locale={locale} labels={labels.search} />
        <div className="contents max-sm:hidden">
          <ShellSettings locale={locale} path={path} labels={labels} />
        </div>
        <MobileMenu
          label={labels.shell.menu}
          title={labels.shell.sidebarTitle}
          navLabel={labels.shell.siteNav}
          footer={<ShellSettings locale={locale} path={path} labels={labels} />}
        >
          <SidebarGroups locale={locale} current={current} labels={labels} />
        </MobileMenu>
      </NavbarActions>
    </NavbarRoot>
  )
}
