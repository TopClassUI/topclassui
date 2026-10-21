import type { ComponentType } from 'react'
import { Button } from 'topclassui/button'
import { Icon } from 'topclassui/icon'

import type { SiteLabels } from '../../labels'
import { EXTERNAL_REL } from '../../lib/external'
import { GITHUB_URL, HANDLE, X_URL, YOUTUBE_URL } from '../../lib/site'
import { TILE, TINT } from '../classes'
import { GithubMark, XMark, YoutubeMark } from './brand-logos'

type Tone = 'primary' | 'danger' | 'neutral'

interface Network {
  key: 'github' | 'youtube' | 'x'
  url: string | null
  tone: Tone
  Mark: ComponentType<{ className?: string }>
}

const NETWORKS: readonly Network[] = [
  { key: 'github', url: GITHUB_URL, tone: 'primary', Mark: GithubMark },
  { key: 'youtube', url: YOUTUBE_URL, tone: 'danger', Mark: YoutubeMark },
  { key: 'x', url: X_URL, tone: 'neutral', Mark: XMark },
]

/** "github.com/TopClassUI/topclassui", the address without its scheme, as the card prints it. */
function shortOf(url: string): string {
  return url.replace(/^https:\/\/(www\.)?/, '')
}

/** Follow us: one tinted card per network that has an address, three across as drawn. */
export function FollowCards({ labels }: { labels: SiteLabels }) {
  const text = labels.home.follow
  return (
    <ul className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {NETWORKS.map(({ key, url, tone, Mark }) => {
        if (url === null) return null
        const card = text[key]
        return (
          <li key={key} className={`docs-lift docs-follow docs-hover-lift flex flex-col items-start gap-4 rounded-[1.25rem] px-7 pt-7 pb-8 text-start ${TINT[tone]}`}>
            <div className="flex items-center gap-3.5">
              <span aria-hidden="true" className={`docs-tile inline-flex size-14 shrink-0 items-center justify-center rounded-[1rem] ${TILE[tone]}`}><Mark className="size-7" /></span>
              <div className="flex flex-col gap-0.75">
                <h3 className="text-xl leading-[normal] font-semibold">{card.name}</h3>
                <p dir="ltr" className="text-start font-mono text-xs rtl:text-end">{HANDLE}</p>
              </div>
            </div>
            <p className="text-sm leading-[1.55] opacity-90">{card.line}</p>
            <Button tone={tone} variant="solid" size="custom" className="docs-press px-4 py-2.5 text-sm leading-[normal]" render={<a href={url} rel={EXTERNAL_REL} />}>
              {card.action}
              <Icon name="arrow-square-out" />
            </Button>
            <p dir="ltr" className="font-mono text-[0.6875rem] leading-[normal]">{shortOf(url)}</p>
          </li>
        )
      })}
    </ul>
  )
}
