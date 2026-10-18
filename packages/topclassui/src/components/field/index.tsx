// No 'use client': the label, the hint, the error and every id are server HTML, linked before any script runs.
import { useId } from 'react'

// Named here as well, so a consumer program that never compiles shared/ gets the --tc-* keys.
import type {} from '#shared/style-tokens.js'
import { FIELD_DEFAULTS } from './constants.js'
import { messagesOf, toFieldIds } from './lib.js'
import { FieldFrame } from './parts/field-frame.js'
import type { FieldProps } from './types.js'

/** A label, a hint and an error wired to the control its child renders: `{(control) => <Input {...control} />}`. */
export function Field({
  name, label, hint, error, id, invalid, required = FIELD_DEFAULTS.required, inline = FIELD_DEFAULTS.inline, children, ...root
}: FieldProps) {
  const generated = useId()
  const messages = messagesOf(error)
  return (
    <FieldFrame
      ids={toFieldIds(id ?? generated)} name={name} label={label} hint={hint} messages={messages}
      invalid={invalid ?? messages.length > 0} required={required} inline={inline} root={root}
    >
      {children}
    </FieldFrame>
  )
}

export { FieldLive } from './client.js'
export type { FieldControl, FieldDesignProps, FieldError, FieldLiveProps, FieldProps } from './types.js'
