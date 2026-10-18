import Link from 'next/link'
import { Badge } from 'topclassui/badge'
import { Button } from 'topclassui/button'
import { FOCUS_RING, TOUCH_TARGET } from 'topclassui/classes'
import { CodeBlock } from 'topclassui/code-block'
import { Icon } from 'topclassui/icon'
import { getLabels } from 'topclassui/labels/get-labels'

import { LIVE_GUIDES, hrefOf, pageBySlug, type Locale } from '../../content/pages'
import type { SiteLabels } from '../../labels'
import { highlight } from '../../lib/highlight'
import { GITHUB_URL, INSTALL_LINE, PRERELEASE, VERSION } from '../../lib/site'

/** The version chip, the h1, the lead, the install line and the two calls to action (docs-site page 1). */
export async function Hero({ locale, labels }: { locale: Locale; labels: SiteLabels }) {
  const hero = labels.home.hero
  const changelog = pageBySlug('changelog')
  const docs = LIVE_GUIDES[0]
  const [major = '0', minor = '0'] = VERSION.split('.')
  const chip = <Badge tone="primary"><bdi>{hero.chip(`${major}.${minor}`, PRERELEASE)}</bdi></Badge>
  return (
    <div className="relative isolate flex flex-col items-center gap-6 pt-16 text-center md:pt-28">
      <div aria-hidden="true" className="docs-glow" />
      {changelog === undefined ? chip : <Link href={hrefOf(changelog, locale)} className={`inline-flex items-center justify-center rounded-chip ${TOUCH_TARGET} ${FOCUS_RING}`}>{chip}</Link>}
      <h1 className="flex flex-col text-5xl font-semibold text-body lg:text-[clamp(3rem,6vw,5.75rem)] lg:leading-none">
        <span>{hero.titleTop}</span>
        <span>{hero.titleBottom}</span>
      </h1>
      <p className="max-w-2xl text-lg text-muted lg:text-xl">{hero.lead}</p>
      <div className="w-full max-w-sm text-start">
        <CodeBlock {...getLabels(locale)} lang="bash" title={labels.blocks.terminal} highlighted={(await highlight(INSTALL_LINE, 'bash')) ?? undefined}>
          {INSTALL_LINE}
        </CodeBlock>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {docs === undefined ? null : (
          <Button size="lg" render={<Link href={hrefOf(docs, locale)} />}>
            <Icon name="book-open" />
            {hero.readDocs}
          </Button>
        )}
        {GITHUB_URL === null ? null : (
          <Button size="lg" variant="outline" tone="neutral" render={<a href={GITHUB_URL} />}>
            <Icon name="github-logo" />
            {hero.star}
          </Button>
        )}
      </div>
    </div>
  )
}
