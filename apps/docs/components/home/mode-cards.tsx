import { Badge } from 'topclassui/badge'
import { Button } from 'topclassui/button'
import { BORDER } from 'topclassui/classes'
import { Field } from 'topclassui/field'
import { Input } from 'topclassui/input'
import { Switch } from 'topclassui/switch'

import type { Mode, SiteLabels } from '../../labels'

const MODES = ['light', 'dark', 'ocean'] as const satisfies readonly Mode[]

/** The same small form under each mode: a scoped data-theme around real components, nothing else (docs-site page 1). */
export function ModeCards({ labels }: { labels: SiteLabels }) {
  const text = labels.home.modes
  return (
    <figure className="flex flex-col gap-3">
      <div inert className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {MODES.map((mode) => (
          <div key={mode} data-theme={mode} className={`flex flex-col gap-4 rounded-box bg-page p-5 text-body ${BORDER}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">{labels.mode[mode]}</p>
              <code dir="ltr" className="font-mono text-xs text-muted">{`data-theme="${mode}"`}</code>
            </div>
            <Field name={`email-${mode}`} label={text.email} id={`email-${mode}`}>
              {(control) => <Input {...control} type="email" size="sm" fullWidth defaultValue="omar@example.com" />}
            </Field>
            <div className="flex flex-wrap gap-2">
              <Badge tone="success">{text.paid}</Badge>
              <Badge tone="warning">{text.pending}</Badge>
              <Badge tone="danger">{text.overdue}</Badge>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch id={`digest-${mode}`} defaultChecked />
              {text.digest}
            </label>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">{text.save}</Button>
              <Button size="sm" variant="outline" tone="neutral">{text.cancel}</Button>
            </div>
          </div>
        ))}
      </div>
      <figcaption className="text-center text-sm text-muted">{text.caption}</figcaption>
    </figure>
  )
}
