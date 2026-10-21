import Link from 'next/link'
import { Button } from 'topclassui/button'
import { BORDER, FOCUS_RING, HOVER, TOUCH_TARGET, TRANSITION } from 'topclassui/classes'
import { Icon } from 'topclassui/icon'

import { LIVE_GUIDES, hrefOf, pageBySlug, type Locale } from '../../content/pages'
import type { SiteLabels } from '../../labels'
import { EXTERNAL_REL } from '../../lib/external'
import { GITHUB_URL, INSTALL_LINE, PRERELEASE, VERSION } from '../../lib/site'
import { CommandBox } from '../command-box'

const CHIP = `inline-flex items-center gap-2 rounded-chip bg-surface ps-3 pe-3.5 py-1.5 text-sm font-medium text-muted ${BORDER}`

/** The drawn calls to action: 16 px on a 19 px line, 22 px from the edge; the Button's own 1 px line (transparent on the solid one) is part of that. */
const CTA = {
  docs: 'px-5.25 py-3 text-base/[1.1875rem]',
  star: 'bg-surface-raised px-5.5 py-3.25 text-base/[1.1875rem] text-body',
} as const

/** The version chip, the h1, the lead, one row (the install line and the two calls to action) and the caption under it (docs-site page 1). */
export function Hero({ locale, labels }: { locale: Locale; labels: SiteLabels }) {
  const hero = labels.home.hero
  const changelog = pageBySlug('changelog')
  const docs = LIVE_GUIDES[0]
  const [major = '0', minor = '0'] = VERSION.split('.')
  const release = `${major}.${minor}`
  const chip = (
    <>
      <span aria-hidden="true" className="size-2 rounded-chip bg-warning-solid" />
      <bdi>{hero.chip(release, PRERELEASE)}</bdi>
    </>
  )
  return (
    <div className="flex flex-col items-center pt-16 text-center md:pt-28">
      {changelog === undefined ? <p className={CHIP}>{chip}</p> : (
        <Link href={hrefOf(changelog, locale)} className={`docs-hover-lift ${CHIP} ${HOVER.outline} ${FOCUS_RING} ${TOUCH_TARGET} ${TRANSITION}`}>{chip}</Link>
      )}
      <h1 className="mt-7.5 flex flex-col text-[clamp(2.25rem,1rem+7vw,3rem)] font-semibold text-body lg:text-[clamp(3rem,5.55vw,5rem)] lg:leading-[1.04]">
        <span>{hero.titleTop}</span>
        <span>{hero.titleBottom}</span>
      </h1>
      <p className="mt-6.5 max-w-180 text-lg text-muted lg:text-xl">{hero.lead}</p>
      <div className="mt-10 flex w-full flex-wrap items-center justify-center gap-3">
        <div className="w-full max-w-sm sm:w-auto">
          <CommandBox code={INSTALL_LINE} locale={locale} size="lg" prompt />
        </div>
        {docs === undefined ? null : (
          <Button size="custom" className={CTA.docs} render={<Link href={hrefOf(docs, locale)} />}>
            <Icon name="book-open" size="1.125rem" />
            {hero.readDocs}
          </Button>
        )}
        {GITHUB_URL === null ? null : (
          <Button size="custom" variant="outline" tone="neutral" className={CTA.star} render={<a href={GITHUB_URL} rel={EXTERNAL_REL} />}>
            <Icon name="github-logo" size="1.125rem" />
            {hero.star}
          </Button>
        )}
      </div>
      <p className="mt-4 text-xs text-muted">{hero.caption(release, PRERELEASE)}</p>
    </div>
  )
}
