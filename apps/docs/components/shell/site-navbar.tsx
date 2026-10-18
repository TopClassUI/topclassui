import Link from 'next/link'
import { getLabels } from 'topclassui/labels/get-labels'
import { Icon } from 'topclassui/icon'
import { NavbarActions, NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot } from 'topclassui/navbar'
import { ICON_BUTTON } from 'topclassui/classes'

import { LIVE_GUIDES, hrefOf, pageBySlug, type Locale } from '../../content/pages'
import type { SiteLabels } from '../../labels/index'
import { GITHUB_URL } from '../../lib/site'
import { LanguageSwitch } from './language-switch'
import { MobileMenu } from './mobile-menu'
import { ModeSwitch } from './mode-switch'
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
  const links = [first === undefined ? null : { key: 'docs', href: hrefOf(first, locale), text: labels.shell.sidebarTitle, slugs: LIVE_GUIDES.map((page) => page.slug) }]
  for (const slug of ['components', 'icons', 'theming']) {
    const page = pageBySlug(slug)
    if (page !== undefined) links.push({ key: slug, href: hrefOf(page, locale), text: page.title[locale], slugs: [slug] })
  }
  return links.filter((link) => link !== null)
}

export function SiteNavbar({ locale, current, path, labels }: SiteNavbarProps) {
  const library = getLabels(locale)
  return (
    <NavbarRoot>
      <NavbarBrand render={<Link href={`/${locale}`} />}>
        <Icon name="palette" />
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
        <ModeSwitch label={labels.mode.label} names={{ light: labels.mode.light, dark: labels.mode.dark, ocean: labels.mode.ocean }} />
        <LanguageSwitch locale={locale} path={path} label={labels.language.label} />
        {GITHUB_URL === null ? null : (
          <a href={GITHUB_URL} className={ICON_BUTTON} aria-label={labels.shell.github}>
            <Icon name="github-logo" />
          </a>
        )}
        <MobileMenu label={labels.shell.menu} title={labels.shell.sidebarTitle} navLabel={labels.shell.siteNav}>
          <SidebarGroups locale={locale} current={current} labels={labels} />
        </MobileMenu>
      </NavbarActions>
    </NavbarRoot>
  )
}
