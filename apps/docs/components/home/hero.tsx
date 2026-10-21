import Link from 'next/link'
import { Button } from 'topclassui/button'
import { BORDER, FOCUS_RING, HOVER, TOUCH_TARGET, TRANSITION } from 'topclassui/classes'
import { Icon } from 'topclassui/icon'

import { LIVE_GUIDES, hrefOf, pageBySlug, type Locale } from '../../content/pages'
import type { SiteLabels } from '../../labels'
import { GITHUB_URL, INSTALL_LINE, PRERELEASE, VERSION } from '../../lib/site'
import { CommandBox } from '../command-box'

const CHIP = `inline-flex items-center gap-2 rounded-chip bg-surface ps-3 pe-3.5 py-1.5 text-sm font-medium text-muted ${BORDER}`

/** The version chip, the h1, the lead, and one row: the install line and the two calls to action (docs-site page 1). */
export function Hero({ locale, labels }: { locale: Locale; labels: SiteLabels }) {
  const hero = labels.home.hero
  const changelog = pageBySlug('changelog')
  const docs = LIVE_GUIDES[0]
  const [major = '0', minor = '0'] = VERSION.split('.')
  const chip = (
    <>
      <span aria-hidden="true" className="size-2 rounded-chip bg-warning-solid" />
      <bdi>{hero.chip(`${major}.${minor}`, PRERELEASE)}</bdi>
    </>
  )
  return (
    <div className="flex flex-col items-center pt-16 text-center md:pt-28">
      {changelog === undefined ? <p className={CHIP}>{chip}</p> : (
        <Link href={hrefOf(changelog, locale)} className={`${CHIP} ${HOVER.outline} ${FOCUS_RING} ${TOUCH_TARGET} ${TRANSITION}`}>{chip}</Link>
      )}
      <h1 className="mt-7.5 flex flex-col text-5xl font-semibold text-body lg:text-[clamp(3rem,6.4vw,5.75rem)] lg:leading-[1.04]">
        <span>{hero.titleTop}</span>
        <span>{hero.titleBottom}</span>
      </h1>
      <p className="mt-6.5 max-w-180 text-lg text-muted lg:text-xl">{hero.lead}</p>
      <div className="mt-10 flex w-full flex-wrap items-center justify-center gap-3">
        <div className="w-full max-w-sm sm:w-auto">
          <CommandBox code={INSTALL_LINE} locale={locale} size="lg" prompt />
        </div>
        {docs === undefined ? null : (
          <Button size="lg" render={<Link href={hrefOf(docs, locale)} />}>
            <Icon name="book-open" />
            {hero.readDocs}
          </Button>
        )}
        {GITHUB_URL === null ? null : (
          <Button size="lg" variant="outline" tone="neutral" render={<a href={GITHUB_URL} rel="noopener noreferrer" />}>
            <Icon name="github-logo" />
            {hero.star}
          </Button>
        )}
      </div>
    </div>
  )
}
