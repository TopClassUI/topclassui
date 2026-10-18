import type { ReactNode } from 'react'

import type { Locale } from '../../content/pages'
import { guideLabelsFor } from '../../labels/guides'
import { labelsFor } from '../../labels/index'
import { CHANGELOG } from '../../lib/guides'
import type { Release } from '../../lib/guide-facts'
import { Callout } from '../mdx/callout'
import { Heading } from '../mdx/heading'

const CODE = 'rounded-chip bg-neutral-soft px-1 font-mono text-sm text-body'

/** A changelog line's inline code, as Changesets writes it in backticks; the rest stays text. */
export function inlineOf(text: string): ReactNode[] {
  return text.split(/(`[^`]+`)/).filter((part) => part !== '').map((part, index) =>
    part.startsWith('`') && part.endsWith('`') ? <code key={index} className={CODE}>{part.slice(1, -1)}</code> : part)
}

function Entry({ release, locale }: { release: Release; locale: Locale }) {
  const labels = guideLabelsFor(locale).changelog
  return (
    <section className="flex flex-col gap-3">
      <Heading anchorLabel={labelsFor(locale).shell.anchor}>{release.version}</Heading>
      {labels.entriesNote === null ? null : <p className="text-base text-body">{labels.entriesNote}</p>}
      <div lang="en" dir="ltr" className="flex flex-col gap-3">
        {release.groups.map((group, index) => (
          <div key={group.title ?? index} className="flex flex-col gap-2">
            {group.title === null ? null : <h3 lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className="text-lg font-semibold text-body">{labels.groups[group.title] ?? group.title}</h3>}
            <ul className="flex list-disc flex-col gap-1 ps-6 text-base text-body">
              {group.items.map((item, at) => (
                <li key={at}>
                  {inlineOf(item.text)}
                  {item.children.length === 0 ? null : (
                    <ul className="flex list-disc flex-col gap-1 ps-6">
                      {item.children.map((child, sub) => <li key={sub}>{inlineOf(child)}</li>)}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

/** The package's CHANGELOG.md, newest first, as docs:data parsed it; the empty-changelog line until a release writes one (docs-site page 17). */
export function Releases({ locale }: { locale: Locale }) {
  if (CHANGELOG.releases.length === 0) return <Callout tone="info">{guideLabelsFor(locale).changelog.empty}</Callout>
  return <>{CHANGELOG.releases.map((release) => <Entry key={release.version} release={release} locale={locale} />)}</>
}
