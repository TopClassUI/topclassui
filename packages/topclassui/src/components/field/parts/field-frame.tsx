// Both halves draw the field here: no 'use client', so Field stays server HTML.
import { Svg } from '#components/svg/index.js'
import { asterisk } from '#icons/data/asterisk.js'
import { warningCircle } from '#icons/data/warning-circle.js'
import { cn } from '#shared/cn.js'
import { hasContent } from '#shared/render-trigger.js'
import {
  FIELD_CONTROL, FIELD_CONTROL_INLINE, FIELD_ERROR, FIELD_ERROR_ICON, FIELD_HINT, FIELD_INLINE, FIELD_LABEL,
  FIELD_LABEL_INLINE, FIELD_NOTE_INLINE, FIELD_REQUIRED, FIELD_ROOT, FIELD_STACK,
} from '../classes.js'
import { describedByOf } from '../lib.js'
import type { FieldControl, FieldRenderProps } from '../types.js'

/** The label, the control, the hint, the error; the ids tie them together in the server HTML, before any script. */
export function FieldFrame({
  ids, name, label, hint, messages, invalid, required, inline, children, root,
}: FieldRenderProps) {
  const hinted = hasContent(hint)
  const erred = messages.length > 0
  const control: FieldControl = {
    id: ids.control,
    name,
    required,
    'aria-labelledby': ids.label,
    'aria-describedby': describedByOf(ids, hinted, erred),
    'aria-invalid': invalid ? true : undefined,
  }
  return (
    <div {...root} className={cn(FIELD_ROOT, inline ? FIELD_INLINE : FIELD_STACK, root.className)}>
      <label id={ids.label} htmlFor={ids.control} className={cn(FIELD_LABEL, inline && FIELD_LABEL_INLINE)}>
        {label}
        {required ? <span aria-hidden="true" className={FIELD_REQUIRED}><Svg icon={asterisk} size="0.625em" /></span> : null}
      </label>
      <div className={inline ? FIELD_CONTROL_INLINE : FIELD_CONTROL}>{children(control)}</div>
      {hinted ? <div id={ids.hint} className={cn(FIELD_HINT, inline && FIELD_NOTE_INLINE)}>{hint}</div> : null}
      {erred ? (
        <div id={ids.error} className={cn(FIELD_ERROR, inline && FIELD_NOTE_INLINE)}>
          <span aria-hidden="true" className={FIELD_ERROR_ICON}><Svg icon={warningCircle} /></span>
          <div>{messages.map((message, index) => <div key={index}>{message}</div>)}</div>
        </div>
      ) : null}
    </div>
  )
}
