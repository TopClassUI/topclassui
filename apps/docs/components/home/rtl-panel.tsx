import { Breadcrumb } from 'topclassui/breadcrumb'
import { Button } from 'topclassui/button'
import { BORDER } from 'topclassui/classes'
import { Icon } from 'topclassui/icon'
import { Input } from 'topclassui/input'
import { getLabels } from 'topclassui/labels/get-labels'
import { Pagination } from 'topclassui/pagination'

import type { SiteLabels } from '../../labels'
import { FACTS } from '../../lib/data'
import { RTL_SAMPLES } from '../../labels/samples'

/** One small form, drawn twice: the second inside dir="rtl" lang="ar", with nothing else changed. */
function SampleForm({ sample }: { sample: (typeof RTL_SAMPLES)[keyof typeof RTL_SAMPLES] }) {
  const library = getLabels(sample.lang)
  return (
    <div lang={sample.lang} dir={sample.dir} className={`flex flex-col gap-3 rounded-box bg-page p-3 ${BORDER}`}>
      <code dir="ltr" className="self-start font-mono text-xs text-muted">{`dir="${sample.dir}"`}</code>
      <Breadcrumb {...library} items={sample.crumbs.map((label) => ({ label }))} />
      <Input type="search" size="sm" aria-label={sample.search} placeholder={sample.search} fullWidth />
      <div className="flex flex-wrap gap-2">
        <Button size="sm">{sample.send}<Icon name="paper-plane-tilt" /></Button>
        <Button size="sm" variant="outline" tone="neutral">{sample.open}<Icon name="arrow-square-out" /></Button>
      </div>
      <Pagination {...library} value={1} pageCount={3} getHref={(page) => `#page-${String(page)}`} size="sm" />
    </div>
  )
}

/** Right to left, enforced: the same components in both directions, and the six pages each demo is checked on. */
export function RtlPanel({ labels }: { labels: SiteLabels }) {
  const text = labels.home.proof.rtl
  const { modes, directions } = FACTS.checks
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-body">{text.title}</h3>
      <p className="text-sm text-muted">{text.lead}</p>
      <figure className="flex flex-col gap-3">
        <div inert className="flex flex-col gap-3">
          <SampleForm sample={RTL_SAMPLES.en} />
          <SampleForm sample={RTL_SAMPLES.ar} />
        </div>
        <figcaption className="sr-only">{text.sample}</figcaption>
      </figure>
      <div className={`flex flex-col gap-1 rounded-box p-3 ${BORDER}`}>
        <p className="text-sm font-semibold text-body">{text.grid}</p>
        <p className="text-xs text-muted">{text.gridNote(modes, directions)}</p>
      </div>
      <p className="text-xs text-muted">{text.note}</p>
    </div>
  )
}
