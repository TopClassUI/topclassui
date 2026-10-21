import { Badge } from 'topclassui/badge'
import { Breadcrumb } from 'topclassui/breadcrumb'
import { Button } from 'topclassui/button'
import { BORDER } from 'topclassui/classes'
import { Icon } from 'topclassui/icon'
import { Input } from 'topclassui/input'
import { Kbd } from 'topclassui/kbd'
import { getLabels } from 'topclassui/labels/get-labels'
import { Pagination } from 'topclassui/pagination'

import type { Mode, SiteLabels } from '../../labels'
import { FACTS } from '../../lib/data'
import { RTL_SAMPLES } from '../../labels/samples'
import { PANEL } from '../classes'
import { AdornedInput, ROOM } from './adorned-input'

const MODES = ['light', 'dark', 'ocean'] as const satisfies readonly Mode[]
const DIRECTIONS = ['ltr', 'rtl'] as const

/** One small form, drawn twice: the second inside dir="rtl" lang="ar", with nothing else changed. */
function SampleForm({ sample }: { sample: (typeof RTL_SAMPLES)[keyof typeof RTL_SAMPLES] }) {
  const library = getLabels(sample.lang)
  return (
    <div lang={sample.lang} dir={sample.dir} className={`flex flex-col gap-2 rounded-box bg-surface-raised p-3 ${BORDER}`}>
      <Badge tone="neutral" size="xs" className="self-end font-mono"><span dir="ltr">{`dir="${sample.dir}"`}</span></Badge>
      <div className="flex min-w-0 items-center gap-2 text-sm text-muted">
        <Icon name="house" />
        <Icon name="caret-right" />
        <Breadcrumb {...library} items={sample.crumbs.map((label) => ({ label }))} className="min-w-0" />
      </div>
      <AdornedInput icon="magnifying-glass" end={<Kbd>/</Kbd>}>
        <Input type="search" size="sm" aria-label={sample.search} placeholder={sample.search} fullWidth className={`bg-page ${ROOM.start} ${ROOM.end}`} />
      </AdornedInput>
      <div className="flex flex-wrap gap-2">
        <Button size="xs">{sample.send}<Icon name="paper-plane-tilt" /></Button>
        <Button size="xs" variant="outline" tone="neutral">{sample.open}<Icon name="arrow-square-out" /></Button>
      </div>
      <Pagination {...library} value={1} pageCount={3} getHref={(page) => `#page-${String(page)}`} size="xs" />
    </div>
  )
}

/** Right to left, enforced: the same components in both directions, and the pages each demo is checked on. */
export function RtlPanel({ labels }: { labels: SiteLabels }) {
  const text = labels.home.proof.rtl
  const { modes, directions } = FACTS.checks
  return (
    <div className={PANEL}>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-body">{text.title}</h3>
        <p className="text-xs text-muted">{text.lead}</p>
      </div>
      <figure className="flex flex-col gap-3.5">
        <div inert className="flex flex-col gap-3.5">
          <SampleForm sample={RTL_SAMPLES.en} />
          <SampleForm sample={RTL_SAMPLES.ar} />
        </div>
        <figcaption className="sr-only">{text.sample}</figcaption>
      </figure>
      <table className="w-full border-separate border-spacing-1 text-xs">
        <caption className="pb-1 text-start font-medium text-muted uppercase">{text.grid(modes * directions)}</caption>
        <thead>
          <tr>
            <td />
            {MODES.map((mode) => <th key={mode} scope="col" className="font-medium text-muted">{labels.mode[mode]}</th>)}
          </tr>
        </thead>
        <tbody>
          {DIRECTIONS.map((dir) => (
            <tr key={dir}>
              <th scope="row" className="text-start font-mono font-normal text-muted">{dir}</th>
              {MODES.map((mode) => (
                <td key={mode} className={`rounded-chip bg-page py-0.5 text-center text-success-on-soft ${BORDER}`}>
                  <Icon name="check-circle" size="0.75rem" />
                  <span className="sr-only">{text.checked}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-muted">{text.gridNote(modes, directions)}</p>
      <p className="text-xs text-muted">{text.note}</p>
    </div>
  )
}
