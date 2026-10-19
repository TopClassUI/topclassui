import { Badge } from 'topclassui/badge'
import { Button } from 'topclassui/button'
import { BORDER } from 'topclassui/classes'
import { Field } from 'topclassui/field'
import { Input } from 'topclassui/input'

import type { Mode, SiteLabels } from '../../labels'
import { Switch } from './home-islands'

const MODES = ['light', 'dark', 'ocean'] as const satisfies readonly Mode[]

/** The same small form under each mode: a scoped data-theme around real components, nothing else (docs-site page 1). */
export function ModeCards({ labels }: { labels: SiteLabels }) {
  const text = labels.home.modes
  return (
    <figure className="flex flex-col gap-7">
      <div inert className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {MODES.map((mode) => (
          <div key={mode} data-theme={mode} className={`flex flex-col gap-3.5 rounded-box bg-page p-5.5 text-start text-body ${BORDER}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">{labels.mode[mode]}</p>
              <code dir="ltr" className="font-mono text-xs text-muted">{`data-theme="${mode}"`}</code>
            </div>
            <Field name={`email-${mode}`} label={text.email} id={`email-${mode}`}>
              {(control) => <Input {...control} type="email" size="sm" fullWidth defaultValue="omar@example.com" />}
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">{text.save}</Button>
              <Button size="sm" variant="outline" tone="neutral">{text.cancel}</Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="success" size="xs">{text.paid}</Badge>
              <Badge tone="warning" size="xs">{text.pending}</Badge>
              <Badge tone="danger" size="xs">{text.overdue}</Badge>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch id={`digest-${mode}`} defaultChecked />
              {text.digest}
            </label>
          </div>
        ))}
      </div>
      <figcaption className="text-center text-xs text-muted">{text.caption}</figcaption>
    </figure>
  )
}
