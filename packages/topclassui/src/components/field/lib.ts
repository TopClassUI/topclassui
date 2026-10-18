import { FIELD_ID_SUFFIX } from './constants.js'
import type { FieldError, FieldIds } from './types.js'

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

/** The form a control inside the root belongs to, as useFormValue finds it: its `form`, else the closest one. */
export function formOf(root: HTMLElement): HTMLFormElement | null {
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
