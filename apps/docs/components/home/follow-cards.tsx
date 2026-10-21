import type { ComponentType } from 'react'
import { Button } from 'topclassui/button'
import { Icon } from 'topclassui/icon'

import type { SiteLabels } from '../../labels'
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

/** Follow us: one tinted card per network that has an address; X waits for its handle (choice 12). */
export function FollowCards({ labels }: { labels: SiteLabels }) {
  const text = labels.home.follow
  return (
    <ul className="flex flex-wrap justify-center gap-5">
      {NETWORKS.map(({ key, url, tone, Mark }) => {
        if (url === null) return null
        const card = text[key]
        return (
          <li key={key} className={`docs-lift flex w-full flex-col items-start gap-4 rounded-box px-7 pt-7 pb-8 text-start md:w-96 ${TINT[tone]}`}>
            <div className="flex items-center gap-3.5">
              <span aria-hidden="true" className={`docs-tile inline-flex size-14 items-center justify-center rounded-box ${TILE[tone]}`}><Mark className="size-7" /></span>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-xl font-semibold">{card.name}</h3>
                <p dir="ltr" className="text-start font-mono text-xs rtl:text-end">{HANDLE}</p>
              </div>
            </div>
            <p className="text-sm">{card.line}</p>
            <Button tone={tone} variant="solid" render={<a href={url} rel="noopener noreferrer" />}>
              {card.action}
              <Icon name="arrow-square-out" />
            </Button>
            <p dir="ltr" className="font-mono text-xs">{shortOf(url)}</p>
          </li>
        )
      })}
    </ul>
  )
}
