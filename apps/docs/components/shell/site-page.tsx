import type { ReactNode } from 'react'

import type { Locale } from '../../content/pages'
import { labelsFor } from '../../labels/index'
import { MotionWatch } from './motion-watch'
import { SiteFooter } from './site-footer'
import { SiteNavbar } from './site-navbar'

export interface SitePageProps {
  locale: Locale
  /** The registry slug, for aria-current in the navbar and the sidebar. */
  current: string
  /** The path after the locale, so the language switch keeps the page. */
  path: string
  children: ReactNode
}

/** The navbar, the page and the footer: every page of the site, Home included. */
export function SitePage({ locale, current, path, children }: SitePageProps) {
  const labels = labelsFor(locale)
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNavbar locale={locale} current={current} path={path} labels={labels} />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter locale={locale} labels={labels} />
      <MotionWatch />
    </div>
  )
}
