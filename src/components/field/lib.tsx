// Both halves write their markup here: no 'use client', so Field stays server HTML. No lib.ts beside it (unit-5.md).
import { Svg } from '#components/svg/index.js'
import { asterisk } from '#icons/data/asterisk.js'
import { warningCircle } from '#icons/data/warning-circle.js'
import { cn } from '#shared/cn.js'
import { hasContent } from '#shared/render-trigger.js'
import {
  FIELD_CONTROL, FIELD_CONTROL_INLINE, FIELD_ERROR, FIELD_ERROR_ICON, FIELD_HINT, FIELD_INLINE, FIELD_LABEL,
  FIELD_LABEL_INLINE, FIELD_NOTE_INLINE, FIELD_REQUIRED, FIELD_ROOT, FIELD_STACK,
} from './classes.js'
import { FIELD_ID_SUFFIX } from './constants.js'
import type { FieldControl, FieldError, FieldIds, FieldRenderProps } from './types.js'

/** Every id of a field, from the control's: never from the name, which two fields may share (choice 33). */
export function toFieldIds(controlId: string): FieldIds {
  return {
    control: controlId,
    label: `${controlId}${FIELD_ID_SUFFIX.label}`,
    hint: `${controlId}${FIELD_ID_SUFFIX.hint}`,
    error: `${controlId}${FIELD_ID_SUFFIX.error}`,
  }
}

/** The messages an error holds, empty ones dropped: `''` and `[]` are no error. */
export function messagesOf(error: FieldError | undefined): string[] {
  if (error === undefined) return []
  const all: readonly string[] = typeof error === 'string' ? [error] : error
  return all.filter((message) => typeof message === 'string' && message.trim() !== '')
}

/** The hint's id and then the error's, only those rendered, or undefined when neither is. */
export function describedByOf(ids: FieldIds, hint: boolean, error: boolean): string | undefined {
  const joined = [hint ? ids.hint : '', error ? ids.error : ''].filter((id) => id !== '').join(' ')
  return joined === '' ? undefined : joined
}

/** The label, the control, the hint, the error; the ids tie them together in the server HTML, before any script. */
export function renderField({
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

/** The form a control inside the root belongs to, as useFormValue finds it: its `form`, else the closest one. */
function formOf(root: HTMLElement): HTMLFormElement | null {
  for (const element of root.querySelectorAll('input, textarea, select, button')) {
    const owner = (element as HTMLInputElement).form
    if (owner) return owner
  }
  return root.closest('form')
}

/** What the form would send under the field's name now, a file by its name. Outside a form, the named elements inside the root. */
export function entriesOf(root: HTMLElement | null, name: string): string[] {
  if (!root) return []
  const form = formOf(root)
  const values = form
    ? new FormData(form).getAll(name)
    : [...root.querySelectorAll<HTMLInputElement>('input, textarea, select')]
      .filter((element) => element.name === name && (!['checkbox', 'radio'].includes(element.type) || element.checked))
      .map((element) => element.value)
  return values.map((value) => (typeof value === 'string' ? value : value.name))
}

/** Two readings of a field's entries are the same value. */
export function sameEntries(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index])
}
